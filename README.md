# 🏥 MedFayda - Centralized Health Record Management System

**Solving Ethiopia's Healthcare Data Fragmentation**

A comprehensive, centralized health record management system that eliminates unshared patient data across health centers in Ethiopia. Integrated with Ethiopia's Fayda ID for secure authentication, enabling patients, doctors, and lab technicians to access unified medical records nationwide using the patient's Fayda ID Number (FIN).

  
---

## Contributors  
- Natnael Darsema
- Kidus Paulos
- Foziya Fetudin

---

## Project Synopsis  

### Problem Statement  
Ethiopia’s healthcare system struggles with:  
- **Fragmented patient records** across hospitals.  
- **No centralized system** to access medical history.  
- **Identity verification challenges** during emergencies.  

### Planned Solution  
MedFayda solves this by:  
- **Fayda ID authentication** (OIDC integration) for secure login.  
- **Unified health records** linked to Fayda IDs.  
- **Real-time access** for doctors with patient consent.  
- **SMS fallback** for areas with poor internet.  

### Expected Outcome  
- **faster diagnosis** with instant record access.  
- **Reduced duplicate tests**, saving costs.  
- **Secure, nationwide scalability** via Fayda.  

### Fayda’s Role  
- **Primary identity verification** (government-backed trust).  
- **OIDC integration** for seamless authentication.  
- **Compliance** with national digital ID standards.  

---

## ✨ Core Features

### 🌍 **Centralized Data Access**
- **Nationwide Patient Records** - Single database accessible by all health centers
- **FIN-Based Lookup** - Doctors can access patient records using Fayda ID Number
- **Real-Time Synchronization** - Instant updates across all health facilities
- **Paper-to-Digital Transition** - Complete digitization of medical records

### 🔐 **Secure Authentication & Access**
- **Fayda ID Integration** - Government-grade authentication system
- **Role-Based Access Control** - Patients, doctors, lab technicians, administrators
- **SMS Backup Authentication** - Alternative access for rural areas
- **End-to-End Encryption** - AES-256 encryption for all sensitive data

### 🏥 **Multi-Portal System**
- **Patient Portal** - View medical history, medication reminders, appointments
- **Doctor Portal** - Access/update patient records, add diagnoses, prescriptions
- **Lab Technician Portal** - View records, add lab results and test data
- **Admin Portal** - System management without medical data access

### 🛡️ **Privacy & Security**
- **ISO 27001 Compliant** - International security standards
- **HIPAA-Level Protection** - Healthcare data privacy compliance
- **Comprehensive Audit Logging** - Track all data access and modifications
- **Data Minimization** - Store only essential data, fetch from Fayda ID on-demand

## 🐳 Installation and Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- PostgreSQL 12+ (for local development)

### Option 1: Docker Deployment (Recommended)

**1. Clone the repository:**

```bash
git clone https://github.com/Nati-darse/MedFayda.git
cd MedFayda
```

**2. Deploy with Docker Compose:**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**3. Access the application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL on localhost:5432

### Option 2: Manual Local Development

**1. Set up PostgreSQL:**

```sql
psql -U postgres
CREATE DATABASE medfayda;
CREATE USER medfayda_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE medfayda TO medfayda_user;
```

**2. Backend setup:**

```bash
cd backend
npm install
# Edit .env with your database credentials
npm start
```

**3. Frontend setup:**

```bash
cd frontend
npm install
npm run dev
```

### Docker Commands Reference

```bash
# Build specific service
docker-compose build backend
docker-compose build frontend

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Execute commands in running container
docker-compose exec backend npm run migrate
docker-compose exec postgres psql -U medfayda_user -d medfayda

# Clean up everything
docker-compose down -v --remove-orphans
docker system prune -a
```

## 🛠️ Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens

### Frontend

- **Next.js 14** - React framework
- **JavaScript** - Programming language
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

## 🔐 Authentication Flow

### Fayda ID Login

1. User clicks "Login with Fayda ID"
2. Redirected to official Fayda ID server
3. User authenticates with government credentials
4. System receives authorization code
5. Backend exchanges code for user information
6. User profile created/updated in database
7. JWT token issued for session management

### SMS Login (Backup)

1. User enters phone number
2. System sends 6-digit OTP
3. User enters verification code
4. System validates OTP
5. User account created/authenticated
6. JWT token issued

## 🛡️ Security Features

- **End-to-end encryption** for sensitive data
- **Government-grade authentication** via Fayda ID
- **Role-based access control** (RBAC)
- **Audit logging** for all medical record access
- **HIPAA-compliant** data handling

## 🚀 Production Deployment

### Environment Variables

Create `.env` files with:

```env
# Backend (.env)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=medfayda
DB_USER=medfayda_user
DB_PASSWORD=secure_password_2024
JWT_SECRET=your_super_secure_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
SESSION_SECRET=your_super_secure_session_secret_2024
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Health Checks

- **Backend**: `GET /health`
- **Database**: Automatic health checks in Docker
- **Frontend**: Built-in Next.js health monitoring

---

**Built with ❤️ for Ethiopia's healthcare future** 🇪🇹
