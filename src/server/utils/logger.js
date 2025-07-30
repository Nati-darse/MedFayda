/**
 * Professional logging utility for MedFayda
 * Provides structured logging with different levels
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true';
    this.logFile = path.join(logsDir, `medfayda-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development'
    };

    return JSON.stringify(logEntry);
  }

  writeToFile(formattedMessage) {
    if (this.enableFileLogging) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }

  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > this.level) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const color = COLORS[level] || COLORS.RESET;
    const timestamp = new Date().toISOString();
    console.log(`${color}[${timestamp}] ${level}: ${message}${COLORS.RESET}`);
    
    if (meta && Object.keys(meta).length > 0) {
      console.log(`${color}Meta:${COLORS.RESET}`, meta);
    }

    // File output
    this.writeToFile(formattedMessage);
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // HTTP request logging
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous'
    };

    const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    this.log(level, `${req.method} ${req.originalUrl} - ${res.statusCode}`, meta);
  }

  // Database operation logging
  logDatabase(operation, table, meta = {}) {
    this.debug(`Database ${operation} on ${table}`, meta);
  }

  // Authentication logging
  logAuth(action, userId, meta = {}) {
    this.info(`Auth ${action} for user ${userId}`, meta);
  }

  // Security logging
  logSecurity(event, meta = {}) {
    this.warn(`Security event: ${event}`, meta);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
