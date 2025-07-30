const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemConfig = sequelize.define('SystemConfig', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    comment: 'Configuration key identifier'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Configuration value'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the configuration parameter'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general',
    comment: 'Configuration category (general, security, integration, etc.)'
  },
  dataType: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    comment: 'Data type of the configuration value'
  },
  isEditable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this configuration can be edited through admin interface'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this configuration is visible to non-admin users'
  }
}, {
  tableName: 'system_config',
  timestamps: true,
  indexes: [
    {
      fields: ['category'],
      name: 'idx_system_config_category'
    },
    {
      fields: ['isPublic'],
      name: 'idx_system_config_public'
    }
  ]
});

module.exports = SystemConfig;
