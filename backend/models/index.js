const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Patient = require('./Patient');
const HealthRecord = require('./HealthRecord');
const Appointment = require('./Appointment');
const Reminder = require('./Reminder');

// Define associations
User.hasOne(Patient, {
  foreignKey: 'userId',
  as: 'patientProfile'
});

Patient.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Patient.hasMany(HealthRecord, {
  foreignKey: 'patientId',
  as: 'healthRecords'
});

HealthRecord.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient'
});

HealthRecord.belongsTo(User, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

User.hasMany(HealthRecord, {
  foreignKey: 'doctorId',
  as: 'patientRecords'
});

Patient.hasMany(Appointment, {
  foreignKey: 'patientId',
  as: 'appointments'
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient'
});

Appointment.belongsTo(User, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

User.hasMany(Appointment, {
  foreignKey: 'doctorId',
  as: 'doctorAppointments'
});

Appointment.belongsTo(User, {
  foreignKey: 'cancelledBy',
  as: 'cancelledByUser'
});

Patient.hasMany(Reminder, {
  foreignKey: 'patientId',
  as: 'reminders'
});

Reminder.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient'
});

Reminder.belongsTo(Appointment, {
  foreignKey: 'relatedAppointmentId',
  as: 'relatedAppointment'
});

Reminder.belongsTo(HealthRecord, {
  foreignKey: 'relatedHealthRecordId',
  as: 'relatedHealthRecord'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Patient,
  HealthRecord,
  Appointment,
  Reminder
};
