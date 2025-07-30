const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

let sequelize = null;

/**
 * Database configuration
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'medfayda',
  username: process.env.DB_USER || 'medfayda_user',
  password: process.env.DB_PASSWORD || 'fayda2017',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? logger.debug : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    connectTimeout: 30000,
    idleTimeoutMillis: 10000,
    application_name: 'MedFayda_Healthcare_System'
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

/**
 * Initialize database connection
 */
async function connectDatabase() {
  try {
    if (sequelize) {
      return sequelize;
    }

    // Create Sequelize instance
    if (process.env.DATABASE_URL) {
      sequelize = new Sequelize(process.env.DATABASE_URL, {
        ...dbConfig,
        logging: dbConfig.logging
      });
    } else {
      sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        dbConfig
      );
    }

    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models in development
    if (process.env.NODE_ENV === 'development' && process.env.SYNC_DATABASE === 'true') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    return sequelize;

  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    logger.info('Database connection closed');
  }
}

/**
 * Get database instance
 */
function getDatabase() {
  return sequelize;
}

/**
 * Health check for database
 */
async function checkDatabaseHealth() {
  try {
    if (!sequelize) {
      return { status: 'disconnected', message: 'Database not initialized' };
    }

    await sequelize.authenticate();
    return { status: 'healthy', message: 'Database connection is active' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

module.exports = {
  connectDatabase,
  closeDatabase,
  getDatabase,
  checkDatabaseHealth,
  sequelize: () => sequelize
};
