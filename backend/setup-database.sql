-- MedFayda PostgreSQL Database Setup Script
-- Run this script to create the database and initial setup

-- Create database (run this as postgres superuser)
-- CREATE DATABASE medfayda;
-- CREATE USER medfayda_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE medfayda TO medfayda_user;

-- Connect to medfayda database and run the rest

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table will be created by Sequelize, but here's the structure for reference:
/*
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "faydaId" VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "phoneNumber" VARCHAR(20),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "dateOfBirth" DATE,
    gender VARCHAR(10),
    role VARCHAR(20) DEFAULT 'patient',
    "isActive" BOOLEAN DEFAULT true,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Patients" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "emergencyContactName" VARCHAR(255),
    "emergencyContactPhone" VARCHAR(20),
    "emergencyContactRelation" VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "HealthRecords" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "patientId" UUID NOT NULL REFERENCES "Patients"(id) ON DELETE CASCADE,
    "doctorId" UUID REFERENCES "Users"(id),
    "visitDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    medications JSONB,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Appointments" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "patientId" UUID NOT NULL REFERENCES "Patients"(id) ON DELETE CASCADE,
    "doctorId" UUID REFERENCES "Users"(id),
    "appointmentDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Reminders" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "reminderDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) DEFAULT 'medication',
    "isCompleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_fayda_id ON "Users"("faydaId");
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON "Users"("phoneNumber");
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON "Patients"("userId");
CREATE INDEX IF NOT EXISTS idx_health_records_patient_id ON "HealthRecords"("patientId");
CREATE INDEX IF NOT EXISTS idx_health_records_visit_date ON "HealthRecords"("visitDate");
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON "Appointments"("patientId");
CREATE INDEX IF NOT EXISTS idx_appointments_date ON "Appointments"("appointmentDate");
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON "Reminders"("userId");
CREATE INDEX IF NOT EXISTS idx_reminders_date ON "Reminders"("reminderDate");

-- Insert sample data (optional)
-- This will be handled by the application when users register
