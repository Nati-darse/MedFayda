const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Patient } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const faydaOIDCService = require('../services/faydaOIDC');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Initialize OIDC service
router.use(async (req, res, next) => {
  try {
    await faydaOIDCService.initialize();
    next();
  } catch (error) {
    console.error('OIDC initialization error:', error);
    res.status(500).json({
      error: 'Authentication Service Unavailable',
      message: 'Unable to initialize authentication service'
    });
  }
});

// Start Fayda ID OIDC authentication
router.get('/fayda-auth', (req, res) => {
  try {
    const { authUrl, codeVerifier, state, nonce } = faydaOIDCService.getAuthorizationUrl();

    // Store PKCE parameters in session (in production, use Redis)
    req.session = req.session || {};
    req.session.codeVerifier = codeVerifier;
    req.session.state = state;
    req.session.nonce = nonce;

    res.status(200).json({
      authUrl,
      state,
      message: 'Redirect user to this URL for Fayda ID authentication'
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

    // Exchange code for tokens
    const tokenSet = await faydaOIDCService.exchangeCodeForTokens(
      code,
      req.session.codeVerifier,
      state,
      req.session.nonce
    );

    // Verify ID token and get claims
    const claims = await faydaOIDCService.verifyIdToken(tokenSet.id_token, req.session.nonce);

    // Map claims to user data
    const userData = faydaOIDCService.mapClaimsToUserData(claims);

    // Check if user already exists
    let user = await User.findOne({ where: { faydaId: userData.faydaId } });

    if (user) {
      // Update last login
      await user.update({ lastLogin: new Date() });
    } else {
      // Create new user
      user = await User.create({
        ...userData,
        role: 'patient',
        lastLogin: new Date()
      });

      // Create patient profile
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

    // Find user by phone number
    const user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'No user found with this phone number'
      });
    }

    // Generate OTP (in production, send via SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in session or cache (simplified for demo)
    // In production, use Redis or similar
    req.session = req.session || {};
    req.session.otp = otp;
    req.session.userId = user.id;

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

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user.id);

    // Clear OTP from session
    delete req.session.otp;
    delete req.session.userId;

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
