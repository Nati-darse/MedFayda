const logger = require('../utils/logger');

/**
 * Professional error handling middleware
 */

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle different types of errors
 */
const handleDatabaseError = (err) => {
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return new AppError(`${field} already exists`, 409, 'DUPLICATE_ENTRY');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('Referenced record does not exist', 400, 'FOREIGN_KEY_ERROR');
  }

  return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again', 401, 'EXPIRED_TOKEN');
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unknown error occurred:', {
      error: err,
      stack: err.stack
    });

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'SequelizeValidationError' || 
      err.name === 'SequelizeUniqueConstraintError' || 
      err.name === 'SequelizeForeignKeyConstraintError') {
    error = handleDatabaseError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors wrapper
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'NOT_FOUND');
  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound
};
