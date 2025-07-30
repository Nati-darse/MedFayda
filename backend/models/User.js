const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  faydaId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Fayda ID - Primary authentication identifier'
  },
  fin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [10, 15] // FIN length validation
    },
    comment: 'Fayda ID Number (FIN) - Used by doctors for patient lookup'
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('patient', 'doctor', 'lab_technician', 'nurse', 'admin', 'receptionist'),
    defaultValue: 'patient',
    allowNull: false,
    comment: 'User role for RBAC - supports centralized access control'
  },
  healthCenterId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Health center ID where medical professional works'
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Professional license number for doctors and lab technicians'
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Medical specialization for doctors'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['faydaId']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    }
  ]
});

// Instance methods
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
};

module.exports = User;
