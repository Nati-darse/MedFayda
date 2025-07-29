const jwt = require('jsonwebtoken');
// const { User } = require('../models'); // Disabled for now

// In-memory storage for development
const { users } = require('../storage/memory');

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from memory (for testing)
    const user = users.get(decoded.userId);
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
      // For testing - simplified patient access check
      if (user.id !== patientId) {
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
