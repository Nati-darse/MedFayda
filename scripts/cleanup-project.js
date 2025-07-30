#!/usr/bin/env node

/**
 * MedFayda Project Cleanup Script
 * Removes unnecessary files and organizes the project structure
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Files and directories to remove
const filesToRemove = [
  // Old test files
  'test-auth.js',
  'test-auth-flow.js',
  
  // Old batch files
  'start-backend.bat',
  'start-development.bat',
  'start-development.sh',
  
  // Duplicate documentation
  'DATABASE_SETUP.md',
  'PRODUCTION_SETUP.md',
  'SETUP_GUIDE.md',
  
  // Old backend files (will be replaced by new structure)
  'backend/simple-server.js',
  'backend/test-server.js',
  'backend/start-server.bat',
  'backend/healthcheck.js',
  
  // Old route files (will be reorganized)
  'backend/routes/betterAuth.js',
  'backend/routes/simple-auth.js',
  'backend/routes/patientPortal.js',
  
  // Old config files
  'backend/config/secureDatabase.js',
  
  // Old storage files
  'backend/storage/memory.js',
  
  // Old scripts
  'backend/scripts/setup-secure-database.ps1',
  'backend/scripts/secure-database-setup.sql',
  
  // Docker files (will be reorganized)
  'backend/Dockerfile',
  'frontend/Dockerfile',
  'docker-compose.yml'
];

// Directories to create for new structure
const directoriesToCreate = [
  'src/server/controllers',
  'src/server/models',
  'src/server/services',
  'src/server/validators',
  'src/server/tests',
  'src/client/src/components/ui',
  'src/client/src/components/forms',
  'src/client/src/components/layout',
  'src/client/src/hooks',
  'src/client/src/lib',
  'src/client/src/types',
  'infrastructure/docker',
  'infrastructure/database/migrations',
  'infrastructure/database/seeds',
  'infrastructure/scripts',
  'docs/api',
  'docs/deployment',
  'docs/development',
  'tools/scripts',
  'logs'
];

/**
 * Remove a file or directory
 */
function removeFileOrDir(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed file: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
  }
}

/**
 * Create directory if it doesn't exist
 */
function createDirectory(dirPath) {
  const fullPath = path.join(projectRoot, dirPath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dirPath}`);
    } else {
      console.log(`ℹ️  Directory already exists: ${dirPath}`);
    }
  } catch (error) {
    console.error(`❌ Error creating directory ${dirPath}:`, error.message);
  }
}

/**
 * Move file from old location to new location
 */
function moveFile(oldPath, newPath) {
  const fullOldPath = path.join(projectRoot, oldPath);
  const fullNewPath = path.join(projectRoot, newPath);
  
  try {
    if (fs.existsSync(fullOldPath)) {
      // Create directory if it doesn't exist
      const newDir = path.dirname(fullNewPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      fs.renameSync(fullOldPath, fullNewPath);
      console.log(`✅ Moved: ${oldPath} → ${newPath}`);
    } else {
      console.log(`⚠️  Source file not found: ${oldPath}`);
    }
  } catch (error) {
    console.error(`❌ Error moving ${oldPath} to ${newPath}:`, error.message);
  }
}

/**
 * Main cleanup function
 */
function cleanup() {
  console.log('🧹 Starting MedFayda project cleanup...\n');
  
  // Remove unnecessary files
  console.log('📁 Removing unnecessary files...');
  filesToRemove.forEach(removeFileOrDir);
  
  console.log('\n📁 Creating new directory structure...');
  // Create new directories
  directoriesToCreate.forEach(createDirectory);
  
  console.log('\n📁 Moving files to new structure...');
  
  // Move frontend files
  if (fs.existsSync(path.join(projectRoot, 'frontend'))) {
    moveFile('frontend', 'src/client');
  }
  
  // Move important backend files to new structure
  const backendFilesToMove = [
    ['backend/package.json', 'src/server/package-old.json'],
    ['backend/middleware/auth.js', 'src/server/middleware/auth.js'],
    ['backend/middleware/auditLog.js', 'src/server/middleware/auditLog.js'],
    ['backend/models', 'src/server/models-old'],
    ['backend/routes/auth.js', 'src/server/routes/auth-old.js'],
    ['backend/routes/patients.js', 'src/server/routes/patients.js'],
    ['backend/routes/appointments.js', 'src/server/routes/appointments.js'],
    ['backend/routes/healthRecords.js', 'src/server/routes/records.js'],
    ['backend/services/faydaOIDC.js', 'src/server/services/faydaOIDC.js']
  ];
  
  backendFilesToMove.forEach(([oldPath, newPath]) => {
    moveFile(oldPath, newPath);
  });
  
  console.log('\n🎉 Project cleanup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the new file structure in src/');
  console.log('2. Update import paths in moved files');
  console.log('3. Test the application: npm run dev');
  console.log('4. Update documentation as needed');
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
