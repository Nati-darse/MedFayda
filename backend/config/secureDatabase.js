const { Sequelize, DataTypes } = require('sequelize');

// Secure database configuration for MedFayda
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Security configurations
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    
    // Connection security
    application_name: 'MedFayda_Healthcare_System',
    
    // Set secure search path (avoid public schema)
    options: '-c search_path=health_data'
  },
  
  // Connection pool settings
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  
  // Query settings
  define: {
    // Use health_data schema by default
    schema: 'health_data',
    
    // Security defaults
    timestamps: true,
    paranoid: true, // Soft deletes for audit trail
    
    // Naming conventions
    underscored: true,
    freezeTableName: true
  },
  
  // Hooks for security
  hooks: {
    beforeConnect: async (config) => {
      console.log('🔒 Establishing secure database connection...');
    },
    
    afterConnect: async (connection, config) => {
      // Set session variables for RLS
      await connection.query("SET app.current_user_id = ''");
      await connection.query("SET app.current_facility_id = ''");
      await connection.query("SET app.user_role = ''");
      await connection.query("SET app.emergency_access = 'false'");
      console.log('✅ Secure database connection established');
    }
  }
});

// Secure Patient model using Ethiopian National ID
const SecurePatient = sequelize.define('Patient', {
  // Ethiopian National ID as primary key
  nationalId: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    validate: {
      isEthiopianId(value) {
        if (!/^ET-[0-9]{8}$/.test(value)) {
          throw new Error('Invalid Ethiopian National ID format. Must be ET-XXXXXXXX');
        }
      }
    },
    comment: 'Ethiopian National ID (Primary Key)'
  },
  
  // Fayda ID for government integration
  faydaId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Fayda ID for government authentication'
  },
  
  // Encrypted personal data
  firstNameEncrypted: {
    type: DataTypes.BLOB,
    allowNull: false,
    comment: 'Encrypted first name'
  },
  
  lastNameEncrypted: {
    type: DataTypes.BLOB,
    allowNull: false,
    comment: 'Encrypted last name'
  },
  
  dateOfBirthEncrypted: {
    type: DataTypes.BLOB,
    allowNull: false,
    comment: 'Encrypted date of birth'
  },
  
  gender: {
    type: DataTypes.ENUM('M', 'F', 'O'),
    allowNull: false,
    comment: 'Gender (M/F/O)'
  },
  
  phoneEncrypted: {
    type: DataTypes.BLOB,
    allowNull: true,
    comment: 'Encrypted phone number'
  },
  
  emailEncrypted: {
    type: DataTypes.BLOB,
    allowNull: true,
    comment: 'Encrypted email address'
  },
  
  // Patient-controlled access permissions
  accessControls: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      allowEmergencyAccess: true,
      dataSharingConsent: false,
      researchParticipation: false,
      authorizedFacilities: [],
      restrictedDataTypes: []
    },
    comment: 'Patient-controlled access permissions'
  },
  
  // Audit fields
  lastAccessed: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time record was accessed'
  },
  
  accessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times record has been accessed'
  },
  
  // Data integrity
  dataHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'SHA-256 hash for data integrity verification'
  },
  
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Record version for optimistic locking'
  }
}, {
  tableName: 'patients',
  schema: 'health_data',
  
  // Hooks for encryption and audit
  hooks: {
    beforeCreate: async (patient) => {
      // Encrypt sensitive data before saving
      patient.firstNameEncrypted = await encryptData(patient.firstName, 'patient_data');
      patient.lastNameEncrypted = await encryptData(patient.lastName, 'patient_data');
      patient.dateOfBirthEncrypted = await encryptData(patient.dateOfBirth, 'patient_data');
      
      if (patient.phoneNumber) {
        patient.phoneEncrypted = await encryptData(patient.phoneNumber, 'patient_data');
      }
      
      if (patient.email) {
        patient.emailEncrypted = await encryptData(patient.email, 'patient_data');
      }
      
      // Generate data hash
      patient.dataHash = generateDataHash(patient);
    },
    
    beforeUpdate: async (patient) => {
      // Re-encrypt if data changed
      if (patient.changed('firstName')) {
        patient.firstNameEncrypted = await encryptData(patient.firstName, 'patient_data');
      }
      
      // Update version and hash
      patient.version += 1;
      patient.dataHash = generateDataHash(patient);
    },
    
    afterFind: async (patients) => {
      // Decrypt data for application use
      if (Array.isArray(patients)) {
        for (const patient of patients) {
          await decryptPatientData(patient);
        }
      } else if (patients) {
        await decryptPatientData(patients);
      }
    }
  }
});

// Secure Medical Records model
const SecureMedicalRecord = sequelize.define('MedicalRecord', {
  recordId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  patientNationalId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: SecurePatient,
      key: 'nationalId'
    },
    comment: 'Patient Ethiopian National ID'
  },
  
  // Healthcare provider information
  facilityId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Healthcare facility identifier'
  },
  
  providerNationalId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Healthcare provider National ID'
  },
  
  providerLicense: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Healthcare provider license number'
  },
  
  // Visit information
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date and time of medical visit'
  },
  
  visitType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type of medical visit'
  },
  
  // Encrypted medical data
  chiefComplaintEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted chief complaint'
  },
  
  diagnosisEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted diagnosis'
  },
  
  treatmentEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted treatment information'
  },
  
  medicationsEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted medications data'
  },
  
  labResultsEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted lab results'
  },
  
  vitalSignsEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted vital signs'
  },
  
  notesEncrypted: {
    type: DataTypes.BLOB,
    comment: 'Encrypted medical notes'
  },
  
  // Emergency access (unencrypted critical info)
  emergencySummary: {
    type: DataTypes.TEXT,
    comment: 'Critical info for emergency access'
  },
  
  allergies: {
    type: DataTypes.TEXT,
    comment: 'Patient allergies (critical for emergency care)'
  },
  
  bloodType: {
    type: DataTypes.STRING(3),
    comment: 'Blood type (critical for emergency care)'
  },
  
  // Audit fields
  createdBy: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'National ID of record creator'
  },
  
  updatedBy: {
    type: DataTypes.STRING(20),
    comment: 'National ID of last updater'
  },
  
  // Data integrity and compliance
  recordHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'SHA-256 hash for data integrity'
  },
  
  encryptionKeyId: {
    type: DataTypes.INTEGER,
    comment: 'Reference to encryption key used'
  },
  
  // Compliance flags
  isSensitive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether record contains sensitive data'
  },
  
  retentionPeriod: {
    type: DataTypes.STRING,
    defaultValue: '7 years',
    comment: 'Data retention period'
  },
  
  canBeShared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether record can be shared'
  }
}, {
  tableName: 'medical_records',
  schema: 'health_data'
});

// Utility functions for encryption/decryption
async function encryptData(data, keyPurpose) {
  if (!data) return null;
  
  try {
    const result = await sequelize.query(
      'SELECT health_data.encrypt_sensitive_data(:data, :keyPurpose) as encrypted',
      {
        replacements: { data: data.toString(), keyPurpose },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    return result[0].encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

async function decryptData(encryptedData, keyPurpose) {
  if (!encryptedData) return null;
  
  try {
    const result = await sequelize.query(
      'SELECT health_data.decrypt_sensitive_data(:encryptedData, :keyPurpose) as decrypted',
      {
        replacements: { encryptedData, keyPurpose },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    return result[0].decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '[ENCRYPTED]';
  }
}

async function decryptPatientData(patient) {
  if (!patient) return;
  
  try {
    patient.firstName = await decryptData(patient.firstNameEncrypted, 'patient_data');
    patient.lastName = await decryptData(patient.lastNameEncrypted, 'patient_data');
    patient.dateOfBirth = await decryptData(patient.dateOfBirthEncrypted, 'patient_data');
    
    if (patient.phoneEncrypted) {
      patient.phoneNumber = await decryptData(patient.phoneEncrypted, 'patient_data');
    }
    
    if (patient.emailEncrypted) {
      patient.email = await decryptData(patient.emailEncrypted, 'patient_data');
    }
  } catch (error) {
    console.error('Patient data decryption error:', error);
  }
}

function generateDataHash(data) {
  const crypto = require('crypto');
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Set up associations
SecurePatient.hasMany(SecureMedicalRecord, {
  foreignKey: 'patientNationalId',
  sourceKey: 'nationalId'
});

SecureMedicalRecord.belongsTo(SecurePatient, {
  foreignKey: 'patientNationalId',
  targetKey: 'nationalId'
});

module.exports = {
  sequelize,
  SecurePatient,
  SecureMedicalRecord,
  encryptData,
  decryptData
};
