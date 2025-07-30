const { Sequelize } = require('sequelize');
require('dotenv').config();

// Validate required environment variables
const REQUIRED_ENV = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
REQUIRED_ENV.forEach(env => {
  if (!process.env[env]) throw new Error(`Missing ${env} in environment variables`);
});

// Ethiopian healthcare-specific configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: require('pg'), // Use pure pg driver

    //  SECURITY CONFIGURATION 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA?.replace(/\\n/g, '\n') // For Ethiopian govt CA
      },
      application_name: 'MedFayda_ETH_v1.0',
      connect_timeout: 30000,
      options: `-c search_path=health_data -c statement_timeout=30000`
    },

    //  ETHIOPIAN HEALTHCARE HOOKS 
    hooks: {
      beforeValidate: (instance) => {
        // Validate Ethiopian National ID format
        if (instance.nationalId && !/^ET-[0-9]{8}$/.test(instance.nationalId)) {
          throw new Error('Invalid Ethiopian National ID format');
        }
      },
      
      beforeConnect: async (config) => {
        console.log('🔐 Establishing HIPAA-compliant connection...');
        
        // Validate Amharic character support
        const testAmharic = await this.query("SELECT 'አማርኛ' AS test");
        if (!testAmharic[0]?.test) {
          throw new Error('Database must support Amharic characters');
        }
      },

      afterConnect: async (connection) => {
        // Set Ethiopian healthcare session variables
        await connection.query(`
          SET app.current_user_id = '';
          SET app.current_facility_id = '';
          SET app.emergency_access = 'false';
          SET bytea_output = 'escape';  -- Required for Amharic text
        `);
      }
    },

    //  PERFORMANCE OPTIMIZATION 
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000,
      evict: 60000,
      validate: (connection) => {
        return connection.query('SELECT 1').catch(() => false);
      }
    },

    //  DATA MODEL SECURITY 
    define: {
      schema: 'health_data',
      timestamps: true,
      paranoid: true, // Soft deletes for audit trail
      underscored: true,
      freezeTableName: true,
      hooks: {
        beforeCreate: (instance) => {
          instance.createdBy = process.env.SYSTEM_ID || 'MedFayda_System';
        }
      }
    },

    //  SAFE LOGGING 
    logging: process.env.NODE_ENV === 'development' 
      ? (query, timing) => {
          const redactedQuery = query
            .replace(/password='.*?'/g, "password='[REDACTED]'")
            .replace(/token='.*?'/g, "token='[REDACTED]'");
          console.log(`[${timing}ms] ${redactedQuery}`);
        }
      : false,

    
    transactionType: 'IMMEDIATE', // Prevent deadlocks
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ
  }
);

// Ethiopian health data validation middleware
sequelize.validateEthiopianId = (id) => {
  if (!/^ET-[0-9]{8}$/.test(id)) {
    throw new Error('Invalid Ethiopian National ID');
  }
  return true;
};

module.exports = sequelize;