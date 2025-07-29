const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reminder = sequelize.define('Reminder', {
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
  type: {
    type: DataTypes.ENUM('appointment', 'medication', 'checkup', 'vaccination', 'lab-test', 'follow-up'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    allowNull: true
  },
  recurringInterval: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'acknowledged', 'dismissed'),
    defaultValue: 'pending'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  method: {
    type: DataTypes.ENUM('sms', 'email', 'push', 'all'),
    defaultValue: 'sms'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  relatedAppointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  relatedHealthRecordId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'health_records',
      key: 'id'
    }
  }
}, {
  tableName: 'reminders',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['scheduledDate']
    },
    {
      fields: ['reminderDate']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    }
  ]
});

module.exports = Reminder;
