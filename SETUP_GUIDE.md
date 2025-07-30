# 🏥 MedFayda Setup Guide - Real Database & BetterAuth

Complete setup guide for MedFayda centralized health records system with PostgreSQL and BetterAuth authentication.

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🗄️ Step 1: PostgreSQL Database Setup

### Install PostgreSQL (if not already installed)

**Windows:**
```bash
# Download installer from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User

```bash
# Connect as postgres superuser
sudo -u postgres psql
# Or on Windows: psql -U postgres
```

```sql
-- Create the centralized database
CREATE DATABASE medfayda_central;

-- Create dedicated user with strong password
CREATE USER medfayda_admin WITH PASSWORD 'MedFayda_Ethiopia_2024!@#';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE medfayda_central TO medfayda_admin;

-- Connect to the database
\c medfayda_central

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO medfayda_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medfayda_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medfayda_admin;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit
\q
```

### Verify Database Connection

```bash
# Test connection with new user
psql -h localhost -U medfayda_admin -d medfayda_central

# Should connect successfully
# Type \q to exit
```

## 🚀 Step 2: Backend Setup

### Clone and Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Install additional packages for BetterAuth (if needed)
npm install jsonwebtoken bcryptjs express-validator
```

### Configure Environment Variables

The `.env` file is already configured with the correct database settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medfayda_central
DB_USER=medfayda_admin
DB_PASSWORD=MedFayda_Ethiopia_2024!@#
DATABASE_URL=postgresql://medfayda_admin:MedFayda_Ethiopia_2024!@#@localhost:5432/medfayda_central

# Security & Authentication
JWT_SECRET=MedFayda_Ethiopia_JWT_Secret_2024_Centralized_Health_System_Secure
SESSION_SECRET=MedFayda_Ethiopia_Session_Secret_2024_Government_Grade_Security

# Development Settings
DEBUG_MODE=true
MOCK_FAYDA_ID=true
MOCK_SMS=true
SEED_DATABASE=true
```

### Initialize Database

```bash
# Run database initialization script
npm run init-db
```

You should see output like:
```
🏥 MedFayda Database Initialization Starting...

1️⃣  Testing database connection...
✅ Database connection established successfully

2️⃣  Creating database tables...
✅ All database tables created/updated successfully

3️⃣  Seeding database with initial data...
✅ Database seeded with initial data

🎉 Database initialization completed successfully!
```

### Start Backend Server

```bash
# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
🌍 Environment: development
✅ PostgreSQL database connection established successfully.
✅ Database synchronized successfully.
🗄️  Using PostgreSQL database
```

## 🎨 Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Ready in 2.1s
```

## 🧪 Step 4: Test the System

### 1. Access the Application

Open your browser and go to: **http://localhost:3000**

### 2. Test Authentication Methods

#### **Fayda ID Login (Mock Mode)**
1. Click "Login with Fayda ID"
2. You'll be redirected to a mock callback
3. Should automatically create a test user and redirect to dashboard

#### **SMS Login**
1. Click "SMS Login"
2. Enter any phone number (e.g., +251911234567)
3. Use any 6-digit OTP (e.g., 123456)
4. Should create a user and redirect to dashboard

### 3. Test Role-Based Access

#### **Patient Portal**
- Default role for new users
- Can view own medical records
- Access: http://localhost:3000/dashboard

#### **Doctor Portal**
- Change user role to 'doctor' in database
- Can search patients by FIN
- Can view/create medical records
- Access: http://localhost:3000/doctor

### 4. Database Verification

```sql
-- Connect to database
psql -h localhost -U medfayda_admin -d medfayda_central

-- Check created tables
\dt

-- View users
SELECT id, "faydaId", fin, "firstName", "lastName", role FROM "Users";

-- View health centers
SELECT id, name, type, city FROM health_centers LIMIT 5;

-- View audit logs
SELECT "userFin", action, "timestamp" FROM audit_logs ORDER BY "timestamp" DESC LIMIT 10;
```

## 🔧 Step 5: Advanced Configuration

### Enable Real Fayda ID Integration

1. Get credentials from Ethiopian Government
2. Update `.env` file:
```env
MOCK_FAYDA_ID=false
FAYDA_CLIENT_ID=your_real_client_id
FAYDA_CLIENT_SECRET=your_real_client_secret
```

### Enable Real SMS Integration

1. Get SMS API credentials (Ethio Telecom, etc.)
2. Update `.env` file:
```env
MOCK_SMS=false
SMS_API_KEY=your_sms_api_key
SMS_API_URL=https://api.ethiotelecom.et/sms/v1/send
```

### Production Deployment

1. Set environment to production:
```env
NODE_ENV=production
DEBUG_MODE=false
SEED_DATABASE=false
```

2. Use Docker deployment:
```bash
docker-compose up -d
```

## 🎯 Testing Checklist

- [ ] Database connection successful
- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Fayda ID login works (mock mode)
- [ ] SMS login works with any phone/OTP
- [ ] Patient dashboard displays correctly
- [ ] Doctor portal accessible (change role to 'doctor')
- [ ] Database tables created and seeded
- [ ] Audit logging working

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check if database exists
psql -U postgres -l | grep medfayda
```

### Backend Issues
```bash
# Check logs
npm start

# Verify environment variables
node -e "console.log(process.env.DB_NAME)"
```

### Frontend Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎉 Success!

If all steps completed successfully, you now have:

✅ **Centralized PostgreSQL Database** - All patient records in one place
✅ **BetterAuth Integration** - Secure authentication system
✅ **Multi-Portal Interface** - Patient, Doctor, Lab Technician portals
✅ **Audit Logging** - Complete access tracking
✅ **Role-Based Access Control** - Secure permissions
✅ **Ethiopian Health Centers** - Pre-loaded facility data

Your MedFayda system is ready for testing and development! 🇪🇹🏥
