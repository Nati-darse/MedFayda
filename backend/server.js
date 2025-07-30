const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
require('dotenv').config();

// Try to import database, fallback if not available
let sequelize;
let useDatabase = true;

try {
  sequelize = require('./models').sequelize;
} catch (error) {
  console.log('Database not available, running in development mode without database');
  useDatabase = false;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes
app.use('/api/auth', require('./routes/betterAuth'));

// Only enable database-dependent routes if database is available
if (useDatabase) {
  // Core system routes
  app.use('/api/users', require('./routes/users'));
  app.use('/api/patients', require('./routes/patients'));
  app.use('/api/health-records', require('./routes/healthRecords'));
  app.use('/api/appointments', require('./routes/appointments'));
  app.use('/api/reminders', require('./routes/reminders'));

  // Centralized medical records system
  app.use('/api/medical-records', require('./routes/medicalRecords'));
  app.use('/api/patient-portal', require('./routes/patientPortal'));
} else {
  // Provide simple fallback endpoints for development
  app.get('/api/users', (req, res) => res.json({ message: 'Database not connected - users endpoint disabled' }));
  app.get('/api/patients', (req, res) => res.json({ message: 'Database not connected - patients endpoint disabled' }));
  app.get('/api/health-records', (req, res) => res.json({ message: 'Database not connected - health records endpoint disabled' }));
  app.get('/api/appointments', (req, res) => res.json({ message: 'Database not connected - appointments endpoint disabled' }));
  app.get('/api/reminders', (req, res) => res.json({ message: 'Database not connected - reminders endpoint disabled' }));
  app.get('/api/medical-records', (req, res) => res.json({ message: 'Database not connected - medical records endpoint disabled' }));
  app.get('/api/patient-portal', (req, res) => res.json({ message: 'Database not connected - patient portal endpoint disabled' }));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A record with this information already exists'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Database connection and server startup
async function startServer() {
  try {
    if (useDatabase && sequelize) {
      try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL database connection established successfully.');

        // Sync database (create tables if they don't exist)
        if (process.env.NODE_ENV === 'development') {
          await sequelize.sync({ alter: true });
          console.log('✅ Database synchronized successfully.');
        }
      } catch (dbError) {
        console.log('⚠️  Database connection failed, running in development mode without database');
        console.log('💡 To use database features, ensure PostgreSQL is running and configured');
        useDatabase = false;
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (useDatabase) {
        console.log(`🗄️  Using PostgreSQL database`);
      } else {
        console.log(`🧪 Running in development mode (in-memory storage)`);
        console.log(`💡 Set up PostgreSQL to enable full database features`);
      }
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
