const express = require('express');
const jwt = require('jsonwebtoken');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Mock user data for development
const mockUsers = {
  fayda: {
    id: 'fayda-user-' + Date.now(),
    faydaId: 'FIN' + Date.now(),
    fin: 'FIN' + Date.now(),
    firstName: 'Mock',
    lastName: 'User',
    email: 'mock@medfayda.et',
    role: 'patient'
  },
  sms: {
    id: 'sms-user-' + Date.now(),
    faydaId: 'SMS_' + Date.now(),
    fin: 'SMS911234567',
    firstName: 'SMS',
    lastName: 'User',
    email: 'sms@medfayda.et',
    role: 'patient'
  }
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      fin: user.fin,
      role: user.role
    },
    process.env.JWT_SECRET || 'medfayda-jwt-secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'MedFayda',
      audience: 'MedFayda-Users'
    }
  );
};

/**
 * @route   GET /api/auth/test
 * @desc    Test authentication endpoint
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'MedFayda Auth API is working!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/auth/test',
      'GET /api/auth/fayda/login',
      'POST /api/auth/fayda/callback',
      'POST /api/auth/sms/send-otp',
      'POST /api/auth/sms/verify-otp',
      'POST /api/auth/logout'
    ]
  });
});

/**
 * @route   GET /api/auth/fayda/login
 * @desc    Initiate Fayda ID login
 * @access  Public
 */
router.get('/fayda/login', catchAsync(async (req, res) => {
  const state = 'mock-state-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  // Store state in session for validation
  req.session.faydaState = state;
  
  const authUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?code=mock-code&state=${state}`;
  
  logger.logAuth('fayda_login_initiated', 'anonymous', { state });
  
  res.json({
    authUrl,
    state,
    message: 'Mock Fayda ID authentication (development mode)'
  });
}));

/**
 * @route   POST /api/auth/fayda/callback
 * @desc    Handle Fayda ID callback
 * @access  Public
 */
router.post('/fayda/callback', catchAsync(async (req, res) => {
  const { code, state } = req.body;
  
  if (!code || !state) {
    throw new AppError('Missing authorization code or state', 400, 'MISSING_PARAMETERS');
  }
  
  // Validate state
  if (req.session.faydaState !== state) {
    throw new AppError('State parameter mismatch', 400, 'INVALID_STATE');
  }
  
  // Clear state from session
  delete req.session.faydaState;
  
  // Mock user creation
  const user = {
    ...mockUsers.fayda,
    id: 'mock-user-' + Date.now(),
    faydaId: 'FIN' + Date.now()
  };
  
  const token = generateToken(user);
  
  logger.logAuth('fayda_login_success', user.id, { fin: user.fin });
  
  res.json({
    message: 'Authentication successful',
    token,
    user
  });
}));

/**
 * @route   POST /api/auth/sms/send-otp
 * @desc    Send SMS OTP
 * @access  Public
 */
router.post('/sms/send-otp', catchAsync(async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    throw new AppError('Phone number is required', 400, 'MISSING_PHONE');
  }
  
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionId = 'sms-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  // Store OTP in session
  req.session.smsOtp = {
    otp,
    phoneNumber,
    sessionId,
    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
  };
  
  logger.logAuth('sms_otp_sent', 'anonymous', { phoneNumber, sessionId });
  
  res.json({
    message: 'OTP sent successfully',
    sessionId,
    otp // In production, don't return OTP
  });
}));

/**
 * @route   POST /api/auth/sms/verify-otp
 * @desc    Verify SMS OTP
 * @access  Public
 */
router.post('/sms/verify-otp', catchAsync(async (req, res) => {
  const { sessionId, otp } = req.body;
  
  if (!sessionId || !otp) {
    throw new AppError('Session ID and OTP are required', 400, 'MISSING_PARAMETERS');
  }
  
  const storedOtp = req.session.smsOtp;
  
  if (!storedOtp || storedOtp.sessionId !== sessionId) {
    throw new AppError('Invalid session', 400, 'INVALID_SESSION');
  }
  
  if (Date.now() > storedOtp.expiresAt) {
    delete req.session.smsOtp;
    throw new AppError('OTP has expired', 400, 'EXPIRED_OTP');
  }
  
  if (storedOtp.otp !== otp) {
    throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
  }
  
  // Clear OTP from session
  delete req.session.smsOtp;
  
  // Create user
  const user = {
    ...mockUsers.sms,
    id: 'mock-user-' + Date.now(),
    faydaId: 'SMS_' + Date.now(),
    phoneNumber: storedOtp.phoneNumber
  };
  
  const token = generateToken(user);
  
  logger.logAuth('sms_login_success', user.id, { phoneNumber: storedOtp.phoneNumber });
  
  res.json({
    message: 'OTP verification successful',
    token,
    user
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', catchAsync(async (req, res) => {
  // Clear session
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err);
    }
  });
  
  logger.logAuth('logout', req.user?.id || 'anonymous');
  
  res.json({
    message: 'Logout successful'
  });
}));

module.exports = router;
