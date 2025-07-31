const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

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

// Test endpoint
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

// Start Fayda ID OIDC authentication
router.get('/fayda/login', (req, res) => {
  try {
    const state = 'test-state-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const authUrl = `http://localhost:3000/auth/callback?code=test-code&state=${state}`;

    sessionStore.set(state, {
      timestamp: Date.now(),
      used: false
    });

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

// Handle OIDC callback
router.post('/fayda/callback', [
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

    const storedSession = sessionStore.get(state);
    const sessionValid = req.session && req.session.state === state;
    const memoryValid = storedSession && !storedSession.used;

    if (!sessionValid && !memoryValid) {
      console.log('State verification failed');

      // In development/mock mode, be more lenient with state validation
      if (!useDatabase && process.env.NODE_ENV !== 'production') {
        console.log('Development mode: Allowing state validation bypass');
      } else {
        return res.status(400).json({
          error: 'Invalid State',
          message: 'State parameter mismatch or expired'
        });
      }
    }

    if (storedSession) {
      storedSession.used = true;
    }

    let user;

    if (useDatabase && faydaOIDCService) {
      // Production mode with real OIDC
      try {
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
        }
      } catch (oidcError) {
        console.error('OIDC Error:', oidcError);
        return res.status(500).json({
          error: 'Authentication Failed',
          message: 'Unable to complete Fayda ID authentication'
        });
      }
    } else {
      // Mock mode for development
      console.log('Using mock authentication for development');

      // Create mock user data
      const mockUserData = {
        id: 'mock-user-' + Date.now(),
        faydaId: 'FIN' + Date.now(),
        fin: 'FIN' + Date.now(),
        firstName: 'Mock',
        lastName: 'User',
        email: 'mock@medfayda.et',
        phoneNumber: '+251911234567',
        role: 'patient',
        lastLogin: new Date()
      };

      user = mockUserData;
      memoryUsers.set(user.id, user);
    }

    let token;
    try {
      token = generateToken(user.id);
    } catch (error) {
      console.error('Token generation error:', error);
      return res.status(500).json({
        error: 'Token Generation Failed',
        message: 'Unable to generate authentication token'
      });
    }

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
router.post('/fayda/login', [
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

    let user = await User.findOne({ where: { faydaId } });

    if (user) {
      await user.update({ lastLogin: new Date() });
    } else {
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
router.post('/sms/send-otp', [
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

    let user = await User.findOne({ where: { phoneNumber } });
    console.log(`SMS login attempt for phone: ${phoneNumber}`);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    req.session = req.session || {};
    req.session.otp = otp;
    req.session.phoneNumber = phoneNumber;

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
router.post('/sms/verify-otp', [
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

    let user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
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
  res.status(200).json({
    message: 'Logout successful'
  });
});

module.exports = router;