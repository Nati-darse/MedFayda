const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emergencyContactRelation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chronicConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  insuranceProvider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  insuranceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2), // in cm
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2), // in kg
    allowNull: true
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: true
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'patients',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['bloodType']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Patient;
