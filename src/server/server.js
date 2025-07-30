#!/usr/bin/env node

/**
 * MedFayda Server Entry Point
 * Centralized Health Records System for Ethiopia
 */

const app = require('./app');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');

// Server configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize database connection
    if (process.env.DATABASE_URL) {
      logger.info('Initializing database connection...');
      await connectDatabase();
      logger.info('Database connected successfully');
    } else {
      logger.warn('No database configuration found, running in mock mode');
    }

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🏥 MedFayda Server started successfully`);
      logger.info(`📍 Server running on: http://${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`📊 Health check: http://${HOST}:${PORT}/health`);
      logger.info(`📚 API docs: http://${HOST}:${PORT}/api`);
      
      if (NODE_ENV === 'development') {
        logger.info(`🔧 Development mode - Mock authentication enabled`);
      }
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
