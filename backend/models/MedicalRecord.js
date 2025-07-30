const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientFin: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Patient Fayda ID Number (FIN) for centralized lookup'
  },
  doctorFin: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Doctor Fayda ID Number who created/updated the record'
  },
  healthCenterId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Health center where the record was created'
  },
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date and time of the medical visit'
  },
  visitType: {
    type: DataTypes.ENUM('consultation', 'emergency', 'follow_up', 'lab_test', 'surgery', 'vaccination'),
    allowNull: false,
    comment: 'Type of medical visit'
  },
  chiefComplaint: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Patient primary complaint or reason for visit'
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Medical diagnosis (encrypted)'
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Treatment provided (encrypted)'
  },
  medications: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Prescribed medications with dosage and duration'
  },
  labResults: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Laboratory test results'
  },
  vitalSigns: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Blood pressure, temperature, pulse, etc.'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional medical notes (encrypted)'
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Scheduled follow-up appointment date'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
    comment: 'Record status'
  },
  isEmergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flag for emergency visits'
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Medical images, documents, etc.'
  }
}, {
  tableName: 'medical_records',
  timestamps: true,
  indexes: [
    {
      fields: ['patientFin'],
      name: 'idx_medical_records_patient_fin'
    },
    {
      fields: ['doctorFin'],
      name: 'idx_medical_records_doctor_fin'
    },
    {
      fields: ['healthCenterId'],
      name: 'idx_medical_records_health_center'
    },
    {
      fields: ['visitDate'],
      name: 'idx_medical_records_visit_date'
    },
    {
      fields: ['patientFin', 'visitDate'],
      name: 'idx_medical_records_patient_date'
    }
  ]
});

module.exports = MedicalRecord;
