const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthRecord = sequelize.define('HealthRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  visitType: {
    type: DataTypes.ENUM('consultation', 'emergency', 'follow-up', 'routine-checkup', 'surgery', 'diagnostic'),
    allowNull: false
  },
  chiefComplaint: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  historyOfPresentIllness: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  physicalExamination: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vitalSigns: {
    type: DataTypes.JSONB,
    allowNull: true,
    // Structure: { temperature, bloodPressure, heartRate, respiratoryRate, oxygenSaturation, weight, height }
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  treatmentPlan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescriptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    // Structure: [{ medication, dosage, frequency, duration, instructions }]
  },
  labResults: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  imagingResults: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  followUpInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  hospitalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'health_records',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['doctorId']
    },
    {
      fields: ['visitDate']
    },
    {
      fields: ['visitType']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = HealthRecord;
