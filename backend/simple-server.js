const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// In-memory storage
const users = new Map();
const sessions = new Map();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'test-secret', { expiresIn: '24h' });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Fayda ID auth initiation
app.get('/api/auth/fayda-auth', (req, res) => {
  const state = 'test-state-' + Date.now();
  const authUrl = `http://localhost:3000/auth/callback?code=test-code&state=${state}`;
  
  sessions.set(state, { timestamp: Date.now() });

  res.json({
    authUrl,
    state,
    message: 'Redirect user to this URL for Fayda ID authentication (TEST MODE)'
  });
});

// Fayda ID callback
app.post('/api/auth/fayda-callback', (req, res) => {
  const { code, state } = req.body;
  
  if (!sessions.has(state)) {
    return res.status(400).json({
      error: 'Invalid State',
      message: 'State parameter mismatch'
    });
  }

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
  sessions.delete(state);
  
  const token = generateToken(userId);

  res.json({
    message: 'Authentication successful (TEST MODE)',
    token,
    user
  });
});

// SMS login
app.post('/api/auth/sms-login', (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Phone number is required'
    });
  }

  const otp = '123456'; // Fixed OTP for testing
  const sessionId = 'sms-' + Date.now();
  
  sessions.set(sessionId, { phoneNumber, otp, timestamp: Date.now() });

  console.log(`OTP for ${phoneNumber}: ${otp}`);

  res.json({
    message: 'OTP sent successfully',
    sessionId,
    otp: otp // In development, show the OTP
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phoneNumber, otp, sessionId } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Phone number and OTP are required'
    });
  }

  // For simplicity, accept any 6-digit OTP
  if (otp.length !== 6) {
    return res.status(400).json({
      error: 'Invalid OTP',
      message: 'OTP must be 6 digits'
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

  res.json({
    message: 'OTP verification successful (TEST MODE)',
    token,
    user
  });
});

// Get user profile
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, 'test-secret');
    const user = users.get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token or user not found'
      });
    }

    res.json({ user });
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid Token',
      message: 'Token verification failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple test server running on http://localhost:${PORT}`);
  console.log('📱 Frontend should be at http://localhost:3000');
  console.log('🔧 Test mode - no database required');
});
