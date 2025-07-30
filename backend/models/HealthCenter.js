const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthCenter = sequelize.define('HealthCenter', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    comment: 'Unique health center identifier'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Official name of the health center'
  },
  type: {
    type: DataTypes.ENUM('hospital', 'health_center', 'clinic', 'laboratory', 'pharmacy'),
    allowNull: false,
    comment: 'Type of health facility'
  },
  level: {
    type: DataTypes.ENUM('primary', 'secondary', 'tertiary', 'specialized'),
    allowNull: false,
    comment: 'Healthcare level classification'
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ethiopian region where facility is located'
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Zone within the region'
  },
  woreda: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Woreda (district) location'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'City or town location'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full address of the facility'
  },
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'GPS coordinates {lat, lng}'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Primary contact phone number'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Official email address'
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Official website URL'
  },
  services: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'List of medical services offered'
  },
  operatingHours: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Operating hours for each day of the week'
  },
  capacity: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Bed capacity, staff count, etc.'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the facility is currently operational'
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Government license number'
  },
  accreditation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Accreditation details and certifications'
  }
}, {
  tableName: 'health_centers',
  timestamps: true,
  indexes: [
    {
      fields: ['region'],
      name: 'idx_health_centers_region'
    },
    {
      fields: ['type'],
      name: 'idx_health_centers_type'
    },
    {
      fields: ['level'],
      name: 'idx_health_centers_level'
    },
    {
      fields: ['city'],
      name: 'idx_health_centers_city'
    },
    {
      fields: ['isActive'],
      name: 'idx_health_centers_active'
    }
  ]
});

module.exports = HealthCenter;
