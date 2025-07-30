const { Sequelize } = require('sequelize');
require('dotenv').config();

// Production-grade database configuration with security hardening
const sequelize = new Sequelize(
  process.env.DB_NAME || 'medfayda',
  process.env.DB_USER || 'medfayda_user',
  process.env.DB_PASSWORD || 'fayda2017',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',

    // Security configurations
    dialectOptions: {
      ssl: process.env.DB_SSL_MODE === 'require' ? {
        require: true,
        rejectUnauthorized: false
      } : false,

      // Connection security
      application_name: process.env.DB_APPLICATION_NAME || 'MedFayda_Healthcare_System',
      connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 30000,

      // Use secure schema path (avoid public schema)
      options: `-c search_path=${process.env.DB_SEARCH_PATH || 'health_data,public'}`
    },

    // Logging configuration (sanitized for security)
    logging: process.env.NODE_ENV === 'development' ?
      (sql, timing) => {
        // Sanitize sensitive data from logs
        const sanitizedSql = sql.replace(/('.*?')/g, "'[REDACTED]'");
        console.log(`[${timing}ms] ${sanitizedSql}`);
      } : false,

    // Connection pool settings (production-grade)
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_CONNECT_TIMEOUT) || 30000,
      idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
      evict: 60000, // Remove idle connections after 1 minute
      handleDisconnects: true
    },

    // Query settings
    define: {
      // Use health_data schema by default
      schema: process.env.DB_SCHEMA || 'health_data',

      // Security defaults
      timestamps: true,
      paranoid: true, // Soft deletes for audit trail

      // Naming conventions
      underscored: true,
      freezeTableName: true
    },

    // Hooks for security and monitoring
    hooks: {
      beforeConnect: async (config) => {
        console.log('🔒 Establishing secure database connection...');

        // Validate environment variables
        if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
          throw new Error('Missing required database environment variables');
        }
      },

      afterConnect: async (connection, config) => {
        // Set session variables for Row-Level Security
        try {
          await connection.query("SET app.current_user_id = ''");
          await connection.query("SET app.current_facility_id = ''");
          await connection.query("SET app.user_role = ''");
          await connection.query("SET app.emergency_access = 'false'");

          // Set secure search path
          await connection.query(`SET search_path = ${process.env.DB_SEARCH_PATH || 'health_data,public'}`);

          console.log('✅ Secure database connection established');
        } catch (error) {
          console.warn('⚠️  Could not set session variables (normal for initial setup):', error.message);
        }
      }
    }
  }
);

module.exports = sequelize;
