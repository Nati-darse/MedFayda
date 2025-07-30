const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Patient, AuditLog } = require('../models');
const { auditActions } = require('../middleware/auditLog');
const router = express.Router();

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Fayda ID authentication initiation
router.get('/fayda/login', auditActions.login, async (req, res) => {
  try {
    if (process.env.MOCK_FAYDA_ID === 'true') {
      // Mock Fayda ID for development
      const state = 'mock-state-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const authUrl = `http://localhost:3000/auth/callback?code=mock-code&state=${state}`;
      
      // Store state for verification
      req.session = req.session || {};
      req.session.faydaState = state;
      
      return res.json({
        authUrl,
        state,
        message: 'Mock Fayda ID authentication (development mode)'
      });
    }

    // Real Fayda ID integration
    const state = 'fayda-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const nonce = 'nonce-' + Math.random().toString(36).substr(2, 9);
    
    const authUrl = new URL(process.env.FAYDA_AUTHORIZATION_URL);
    authUrl.searchParams.set('client_id', process.env.FAYDA_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', process.env.FAYDA_SCOPE);
    authUrl.searchParams.set('redirect_uri', process.env.FAYDA_REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);

    // Store state and nonce for verification
    req.session = req.session || {};
    req.session.faydaState = state;
    req.session.faydaNonce = nonce;

    res.json({
      authUrl: authUrl.toString(),
      state,
      message: 'Redirect to Fayda ID for authentication'
    });
  } catch (error) {
    console.error('Fayda auth initiation error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: 'Unable to initiate Fayda ID authentication'
    });
  }
});

// Fayda ID callback handler
router.post('/fayda/callback', auditActions.login, async (req, res) => {
  try {
    const { code, state } = req.body;

    // Verify state parameter
    if (!req.session?.faydaState || req.session.faydaState !== state) {
      return res.status(400).json({
        error: 'Invalid State',
        message: 'State parameter mismatch'
      });
    }

    let user;

    if (process.env.MOCK_FAYDA_ID === 'true') {
      // Mock user creation for development
      const mockFin = 'FIN' + Date.now().toString().slice(-9);
      
      user = await User.findOne({ where: { fin: mockFin } });
      
      if (!user) {
        user = await User.create({
          faydaId: 'MOCK' + Date.now(),
          fin: mockFin,
          email: 'mock@medfayda.et',
          firstName: 'Mock',
          lastName: 'User',
          phoneNumber: '+251911234567',
          dateOfBirth: '1990-01-01',
          gender: 'other',
          role: 'patient',
          isActive: true,
          lastLogin: new Date()
        });

        // Create patient profile
        await Patient.create({
          userId: user.id,
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '+251911234568',
          emergencyContactRelation: 'Family',
          address: 'Mock Address',
          city: 'Addis Ababa',
          region: 'Addis Ababa'
        });
      } else {
        await user.update({ lastLogin: new Date() });
      }
    } else {
      // Real Fayda ID token exchange
      const tokenResponse = await fetch(process.env.FAYDA_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.FAYDA_CLIENT_ID}:${process.env.FAYDA_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.FAYDA_REDIRECT_URI
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokens = await tokenResponse.json();

      // Get user info from Fayda ID
      const userInfoResponse = await fetch(process.env.FAYDA_USERINFO_URL, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const faydaUser = await userInfoResponse.json();

      // Find or create user
      user = await User.findOne({ where: { faydaId: faydaUser.sub } });

      if (!user) {
        user = await User.create({
          faydaId: faydaUser.sub,
          fin: faydaUser.fin,
          email: faydaUser.email,
          firstName: faydaUser.given_name,
          lastName: faydaUser.family_name,
          phoneNumber: faydaUser.phone_number,
          dateOfBirth: faydaUser.birthdate,
          gender: faydaUser.gender,
          role: faydaUser.role || 'patient',
          isActive: true,
          lastLogin: new Date()
        });

        // Create patient profile if role is patient
        if (user.role === 'patient') {
          await Patient.create({
            userId: user.id,
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelation: '',
            address: '',
            city: '',
            region: ''
          });
        }
      } else {
        await user.update({ lastLogin: new Date() });
      }
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id,
        fin: user.fin,
        role: user.role,
        healthCenterId: user.healthCenterId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Clear session state
    delete req.session.faydaState;
    delete req.session.faydaNonce;

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        faydaId: user.faydaId,
        fin: user.fin,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        healthCenterId: user.healthCenterId,
        specialization: user.specialization
      }
    });
  } catch (error) {
    console.error('Fayda callback error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: error.message || 'Unable to complete authentication'
    });
  }
});

// SMS login - send OTP
router.post('/sms/send-otp', [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  auditActions.login
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = 'sms-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Store OTP
    otpStore.set(sessionId, {
      phoneNumber,
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    if (process.env.MOCK_SMS === 'true') {
      console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
      return res.json({
        message: 'OTP sent successfully',
        sessionId,
        otp: process.env.DEBUG_MODE === 'true' ? otp : undefined
      });
    }

    // Real SMS sending logic would go here
    // Integration with Ethiopian SMS providers

    res.json({
      message: 'OTP sent successfully',
      sessionId
    });
  } catch (error) {
    console.error('SMS send OTP error:', error);
    res.status(500).json({
      error: 'SMS Failed',
      message: 'Unable to send OTP'
    });
  }
});

// SMS login - verify OTP
router.post('/sms/verify-otp', [
  body('sessionId').notEmpty().withMessage('Session ID required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  auditActions.login
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { sessionId, otp } = req.body;
    const otpData = otpStore.get(sessionId);

    if (!otpData) {
      return res.status(400).json({
        error: 'Invalid Session',
        message: 'OTP session not found or expired'
      });
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      otpStore.delete(sessionId);
      return res.status(429).json({
        error: 'Too Many Attempts',
        message: 'Maximum OTP attempts exceeded'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'The OTP you entered is incorrect'
      });
    }

    // OTP verified, find or create user
    const phoneNumber = otpData.phoneNumber;
    let user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      const fin = 'SMS' + phoneNumber.replace(/\D/g, '').slice(-9);
      user = await User.create({
        faydaId: 'SMS_' + Date.now(),
        fin,
        email: `sms${phoneNumber.replace(/\D/g, '').slice(-4)}@medfayda.et`,
        phoneNumber,
        firstName: 'SMS',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'other',
        role: 'patient',
        isActive: true,
        lastLogin: new Date()
      });

      // Create patient profile
      await Patient.create({
        userId: user.id,
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: phoneNumber,
        emergencyContactRelation: 'Self',
        address: 'Address not provided',
        city: 'City not provided',
        region: 'Region not provided'
      });
    } else {
      await user.update({ lastLogin: new Date() });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id,
        fin: user.fin,
        role: user.role,
        healthCenterId: user.healthCenterId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Clean up OTP
    otpStore.delete(sessionId);

    res.json({
      message: 'OTP verification successful',
      token,
      user: {
        id: user.id,
        faydaId: user.faydaId,
        fin: user.fin,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('SMS verify OTP error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Unable to verify OTP'
    });
  }
});

// Logout
router.post('/logout', auditActions.logout, (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
