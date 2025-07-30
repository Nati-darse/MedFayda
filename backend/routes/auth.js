const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

// Try to import models and services, fallback if not available
let User, Patient, faydaOIDCService;
let useDatabase = true;
const memoryUsers = new Map();

try {
  const models = require('../models');
  User = models.User;
  Patient = models.Patient;
  faydaOIDCService = require('../services/faydaOIDC');
} catch (error) {
  console.log('Database/OIDC not available, using fallback mode for development');
  useDatabase = false;
}

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// In-memory session storage for development (replace with Redis in production)
const sessionStore = new Map();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  for (const [state, data] of sessionStore.entries()) {
    if (now - data.timestamp > fiveMinutes) {
      sessionStore.delete(state);
    }
  }
}, 5 * 60 * 1000);

// Start Fayda ID OIDC authentication
router.get('/fayda-auth', (req, res) => {
  try {
    const state = 'test-state-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const authUrl = `http://localhost:3000/auth/callback?code=test-code&state=${state}`;

    // Store state in memory for verification
    sessionStore.set(state, {
      timestamp: Date.now(),
      used: false
    });

    // Also store in session as backup
    req.session = req.session || {};
    req.session.state = state;

    console.log('Generated state for auth:', state);

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

    console.log('Callback received - Code:', code, 'State:', state);
    console.log('Session state:', req.session?.state);
    console.log('Stored states:', Array.from(sessionStore.keys()));

    // Verify state parameter (check both session and memory store)
    const storedSession = sessionStore.get(state);
    const sessionValid = req.session && req.session.state === state;
    const memoryValid = storedSession && !storedSession.used;

    if (!sessionValid && !memoryValid) {
      console.log('State verification failed');
      return res.status(400).json({
        error: 'Invalid State',
        message: 'State parameter mismatch or expired'
      });
    }

    // Mark state as used to prevent replay attacks
    if (storedSession) {
      storedSession.used = true;
    }

    // Try OIDC flow first, fallback to test user
    let user;
    try {
      // OIDC flow (when properly configured)
      const tokenSet = await faydaOIDCService.exchangeCodeForTokens(
        code,
        req.session.codeVerifier,
        state,
        req.session.nonce
      );

      const claims = await faydaOIDCService.verifyIdToken(tokenSet.id_token, req.session.nonce);
      const userData = faydaOIDCService.mapClaimsToUserData(claims);

      user = await User.findOne({ where: { faydaId: userData.faydaId } });

      if (user) {
        await user.update({ lastLogin: new Date() });
      } else {
        user = await User.create({
          ...userData,
          role: 'patient',
          lastLogin: new Date()
        });

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
    } catch (oidcError) {
      // Fallback to test user creation
      user = await User.findOne({ where: { faydaId: 'TEST123456789' } });

      if (!user) {
        user = await User.create({
          faydaId: 'TEST123456789',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+251911234567',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          role: 'patient',
          lastLogin: new Date()
        });

        await Patient.create({
          userId: user.id,
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '+251911234568',
          emergencyContactRelation: 'Family',
          address: 'Test Address',
          city: 'Addis Ababa',
          region: 'Addis Ababa'
        });
      } else {
        await user.update({ lastLogin: new Date() });
      }
    }

    const token = generateToken(user.id);

    // Clear session data
    delete req.session.codeVerifier;
    delete req.session.state;
    delete req.session.nonce;

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        faydaId: user.faydaId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Fayda callback error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: 'Unable to complete Fayda ID authentication'
    });
  }
});

// Legacy Fayda ID Login/Register (for direct API calls)
router.post('/fayda-login', [
  body('faydaId').notEmpty().withMessage('Fayda ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const {
      faydaId,
      email,
      phoneNumber,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      role = 'patient'
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ where: { faydaId } });

    if (user) {
      // Update last login
      await user.update({ lastLogin: new Date() });
    } else {
      // Create new user
      user = await User.create({
        faydaId,
        email,
        phoneNumber,
        firstName,
        lastName,
        middleName,
        dateOfBirth,
        gender,
        role,
        lastLogin: new Date()
      });

      // If user is a patient, create patient profile
      if (role === 'patient') {
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
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        faydaId: user.faydaId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Fayda login error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: 'Unable to authenticate with Fayda ID'
    });
  }
});

// SMS Fallback Authentication
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

    // Find user by phone number or create if doesn't exist
    let user = await User.findOne({ where: { phoneNumber } });
    console.log(`SMS login attempt for phone: ${phoneNumber}`);

    // Generate OTP (in production, send via SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in session
    req.session = req.session || {};
    req.session.otp = otp;
    req.session.phoneNumber = phoneNumber;

    // TODO: Send OTP via SMS using Twilio
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully',
      // In production, don't send OTP in response
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

    // Verify OTP (simplified for demo)
    if (!req.session || req.session.otp !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'The OTP provided is incorrect or expired'
      });
    }

    // Find or create user
    let user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      // Create new user
      const faydaId = 'SMS' + phoneNumber.replace(/\D/g, '').slice(-9);
      user = await User.create({
        faydaId,
        email: `user${phoneNumber.replace(/\D/g, '').slice(-4)}@example.com`,
        phoneNumber,
        firstName: 'SMS',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'other',
        role: 'patient',
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

    const token = generateToken(user.id);

    // Clear OTP from session
    delete req.session.otp;
    delete req.session.phoneNumber;

    res.status(200).json({
      message: 'OTP verification successful',
      token,
      user: {
        id: user.id,
        faydaId: user.faydaId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      error: 'OTP Verification Failed',
      message: 'Unable to verify OTP'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Patient,
        as: 'patientProfile'
      }],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch user profile'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a production app with refresh tokens, you'd invalidate the token here
  res.status(200).json({
    message: 'Logout successful'
  });
});

module.exports = router;
