const jwt = require('jsonwebtoken');

// Try to import models, fallback to in-memory storage if database not available
let User;
let useDatabase = true;
const memoryUsers = new Map();

try {
  User = require('../models').User;
} catch (error) {
  console.log('Database models not available, using in-memory storage for development');
  useDatabase = false;
}

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    let user;

    if (useDatabase && User) {
      // Get user from PostgreSQL database
      try {
        user = await User.findByPk(decoded.userId);
        if (!user || !user.isActive) {
          return res.status(401).json({
            error: 'Access Denied',
            message: 'Invalid token or user not active'
          });
        }
      } catch (dbError) {
        console.log('Database error, falling back to memory storage:', dbError.message);
        useDatabase = false;
        user = memoryUsers.get(decoded.userId);
      }
    } else {
      // Fallback to in-memory storage for development
      user = memoryUsers.get(decoded.userId);
      if (!user) {
        // Create a test user for development
        user = {
          id: decoded.userId,
          faydaId: 'TEST123456789',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'patient',
          isActive: true
        };
        memoryUsers.set(decoded.userId, user);
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Please login again'
      });
    }
    
    return res.status(403).json({
      error: 'Invalid Token',
      message: 'Token verification failed'
    });
  }
};

// Check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user can access patient data
const canAccessPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    // Admin and doctors can access all patient data
    if (['admin', 'doctor'].includes(user.role)) {
      return next();
    }

    // Patients can only access their own data
    if (user.role === 'patient') {
      const { Patient } = require('../models');
      const patient = await Patient.findOne({ where: { userId: user.id } });

      if (!patient || patient.id !== patientId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own medical records'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Server Error',
      message: 'Error checking patient access permissions'
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  canAccessPatient
};
