#!/usr/bin/env node

/**
 * MedFayda Database Initialization Script
 * This script initializes the PostgreSQL database with all required tables and seed data
 */

const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🏥 MedFayda Database Initialization Starting...\n');

    // Test database connection
    console.log('1️⃣  Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync all models (create tables)
    console.log('\n2️⃣  Creating database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All database tables created/updated successfully');

    // Run seed data if enabled
    if (process.env.SEED_DATABASE === 'true') {
      console.log('\n3️⃣  Seeding database with initial data...');
      
      // Read and execute seed SQL file
      const seedSqlPath = path.join(__dirname, '../seed-data.sql');
      if (fs.existsSync(seedSqlPath)) {
        const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = seedSql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await sequelize.query(statement);
            } catch (error) {
              // Ignore duplicate key errors (data already exists)
              if (!error.message.includes('duplicate key') && !error.message.includes('already exists')) {
                console.warn('⚠️  Seed statement warning:', error.message);
              }
            }
          }
        }
        
        console.log('✅ Database seeded with initial data');
      } else {
        console.log('⚠️  Seed data file not found, skipping...');
      }
    }

    // Verify tables exist
    console.log('\n4️⃣  Verifying database structure...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📊 Created tables:', tables.join(', '));

    // Show database statistics
    console.log('\n5️⃣  Database statistics:');
    
    try {
      const { User } = require('../models');
      const userCount = await User.count();
      console.log(`👥 Users: ${userCount}`);
    } catch (error) {
      console.log('👥 Users: Table not ready yet');
    }

    try {
      const { HealthCenter } = require('../models');
      const centerCount = await HealthCenter.count();
      console.log(`🏥 Health Centers: ${centerCount}`);
    } catch (error) {
      console.log('🏥 Health Centers: Table not ready yet');
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Access the application: http://localhost:3000');
    console.log('\n🔐 Authentication options:');
    console.log('   • Fayda ID Login (mock mode enabled)');
    console.log('   • SMS Login (use any phone number, OTP: any 6 digits)');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check database credentials in .env file');
    console.error('   3. Verify database "medfayda_central" exists');
    console.error('   4. Check user "medfayda_admin" has proper permissions');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
