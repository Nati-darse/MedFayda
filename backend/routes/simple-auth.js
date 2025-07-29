const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// In-memory storage for testing
const users = new Map();
const sessions = new Map();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Start Fayda ID authentication (simplified for testing)
router.get('/fayda-auth', (req, res) => {
  try {
    const state = 'test-state-' + Date.now();
    const authUrl = `http://localhost:3000/auth/callback?code=test-code&state=${state}`;
    
    req.session = req.session || {};
    req.session.state = state;

    res.status(200).json({
      authUrl,
      state,
      message: 'Redirect user to this URL for Fayda ID authentication (TEST MODE)'
    });
  } catch (error) {
    console.error('Fayda auth initiation error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: 'Unable to initiate Fayda ID authentication'
    });
  }
});

// Handle OIDC callback (simplified for testing)
router.post('/fayda-callback', [
  body('code').notEmpty().withMessage('Authorization code is required'),
  body('state').notEmpty().withMessage('State parameter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { code, state } = req.body;
    
    // Verify state parameter
    if (!req.session || req.session.state !== state) {
      return res.status(400).json({
        error: 'Invalid State',
        message: 'State parameter mismatch'
      });
    }

    // Simulate successful authentication with test user
    const userId = 'test-user-' + Date.now();
    const user = {
      id: userId,
      faydaId: 'TEST123456789',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient'
    };

    users.set(userId, user);
    const token = generateToken(userId);

    delete req.session.state;

    res.status(200).json({
      message: 'Authentication successful (TEST MODE)',
      token,
      user
    });
  } catch (error) {
    console.error('Fayda callback error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: 'Unable to complete Fayda ID authentication'
    });
  }
});

// SMS Login
router.post('/sms-login', [
  body('phoneNumber').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { phoneNumber } = req.body;
    console.log(`SMS login attempt for phone: ${phoneNumber}`);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    req.session = req.session || {};
    req.session.otp = otp;
    req.session.phoneNumber = phoneNumber;

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('SMS login error:', error);
    res.status(500).json({
      error: 'SMS Authentication Failed',
      message: 'Unable to send OTP'
    });
  }
});

// Verify OTP
router.post('/verify-otp', [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { phoneNumber, otp } = req.body;

    if (!req.session || req.session.otp !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'The OTP provided is incorrect or expired'
      });
    }

    const userId = 'sms-user-' + Date.now();
    const user = {
      id: userId,
      faydaId: 'SMS' + phoneNumber.replace(/\D/g, '').slice(-9),
      email: `user${phoneNumber.replace(/\D/g, '').slice(-4)}@example.com`,
      firstName: 'SMS',
      lastName: 'User',
      role: 'patient',
      phoneNumber: phoneNumber
    };

    users.set(userId, user);
    const token = generateToken(userId);

    delete req.session.otp;
    delete req.session.phoneNumber;

    res.status(200).json({
      message: 'OTP verification successful (TEST MODE)',
      token,
      user
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      error: 'OTP Verification Failed',
      message: 'Unable to verify OTP'
    });
  }
});

module.exports = router;
