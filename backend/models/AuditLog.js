const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userFin: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'FIN of user who performed the action'
  },
  userRole: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Role of user who performed the action'
  },
  patientFin: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'FIN of patient whose record was accessed/modified'
  },
  action: {
    type: DataTypes.ENUM(
      'login', 'logout', 'view_record', 'create_record', 'update_record', 
      'delete_record', 'search_patient', 'export_data', 'system_access'
    ),
    allowNull: false,
    comment: 'Type of action performed'
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type of resource accessed (medical_record, patient, etc.)'
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID of the specific resource accessed'
  },
  healthCenterId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Health center where action was performed'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'IP address of the user'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Browser/device information'
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional details about the action'
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the action was successful'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if action failed'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    comment: 'When the action occurred'
  }
}, {
  tableName: 'audit_logs',
  timestamps: false, // We use custom timestamp field
  indexes: [
    {
      fields: ['userFin'],
      name: 'idx_audit_logs_user_fin'
    },
    {
      fields: ['patientFin'],
      name: 'idx_audit_logs_patient_fin'
    },
    {
      fields: ['action'],
      name: 'idx_audit_logs_action'
    },
    {
      fields: ['timestamp'],
      name: 'idx_audit_logs_timestamp'
    },
    {
      fields: ['healthCenterId'],
      name: 'idx_audit_logs_health_center'
    },
    {
      fields: ['userFin', 'timestamp'],
      name: 'idx_audit_logs_user_time'
    }
  ]
});

module.exports = AuditLog;
