const express = require('express');
const { query, validationResult } = require('express-validator');
const { MedicalRecord, User, HealthCenter, Appointment, Reminder } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditActions } = require('../middleware/auditLog');
const router = express.Router();

// Get patient's own medical records
router.get('/my-records', [
  authenticateToken,
  requireRole(['patient']),
  auditActions.viewRecord
], async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, visitType } = req.query;
    const patientFin = req.user.fin;

    // Build query conditions
    const whereConditions = { patientFin };
    
    if (startDate && endDate) {
      whereConditions.visitDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (visitType) {
      whereConditions.visitType = visitType;
    }

    // Get medical records with pagination
    const records = await MedicalRecord.findAndCountAll({
      where: whereConditions,
      order: [['visitDate', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'specialization'],
          foreignKey: 'doctorFin',
          sourceKey: 'fin'
        },
        {
          model: HealthCenter,
          as: 'healthCenter',
          attributes: ['name', 'type', 'city'],
          foreignKey: 'healthCenterId'
        }
      ]
    });

    res.status(200).json({
      records: records.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(records.count / parseInt(limit)),
        totalRecords: records.count,
        hasNext: parseInt(page) * parseInt(limit) < records.count,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get patient records error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to retrieve your medical records'
    });
  }
});

// Get patient's upcoming appointments
router.get('/my-appointments', [
  authenticateToken,
  requireRole(['patient']),
  auditActions.viewRecord
], async (req, res) => {
  try {
    const patientFin = req.user.fin;
    const now = new Date();

    const appointments = await Appointment.findAll({
      where: {
        patientFin,
        appointmentDate: {
          [Op.gte]: now
        },
        status: ['scheduled', 'confirmed']
      },
      order: [['appointmentDate', 'ASC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'specialization'],
          foreignKey: 'doctorFin',
          sourceKey: 'fin'
        },
        {
          model: HealthCenter,
          as: 'healthCenter',
          attributes: ['name', 'type', 'city', 'phoneNumber'],
          foreignKey: 'healthCenterId'
        }
      ]
    });

    res.status(200).json({
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to retrieve your appointments'
    });
  }
});

// Get patient's medication reminders
router.get('/my-medications', [
  authenticateToken,
  requireRole(['patient']),
  auditActions.viewRecord
], async (req, res) => {
  try {
    const patientFin = req.user.fin;

    // Get active medication reminders
    const reminders = await Reminder.findAll({
      where: {
        patientFin,
        type: 'medication',
        isCompleted: false,
        reminderDate: {
          [Op.gte]: new Date()
        }
      },
      order: [['reminderDate', 'ASC']],
      limit: 20
    });

    // Get recent prescriptions from medical records
    const recentPrescriptions = await MedicalRecord.findAll({
      where: {
        patientFin,
        medications: {
          [Op.ne]: null
        }
      },
      order: [['visitDate', 'DESC']],
      limit: 5,
      attributes: ['visitDate', 'medications', 'doctorFin'],
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
          foreignKey: 'doctorFin',
          sourceKey: 'fin'
        }
      ]
    });

    res.status(200).json({
      reminders,
      recentPrescriptions
    });
  } catch (error) {
    console.error('Get patient medications error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to retrieve your medications'
    });
  }
});

// Get patient dashboard summary
router.get('/dashboard', [
  authenticateToken,
  requireRole(['patient']),
  auditActions.systemAccess
], async (req, res) => {
  try {
    const patientFin = req.user.fin;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts and recent data
    const [
      totalRecords,
      recentRecords,
      upcomingAppointments,
      activeReminders,
      recentVisits
    ] = await Promise.all([
      // Total medical records count
      MedicalRecord.count({
        where: { patientFin }
      }),
      
      // Recent records (last 30 days)
      MedicalRecord.count({
        where: {
          patientFin,
          visitDate: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      }),
      
      // Upcoming appointments
      Appointment.count({
        where: {
          patientFin,
          appointmentDate: {
            [Op.gte]: now
          },
          status: ['scheduled', 'confirmed']
        }
      }),
      
      // Active medication reminders
      Reminder.count({
        where: {
          patientFin,
          type: 'medication',
          isCompleted: false,
          reminderDate: {
            [Op.gte]: now
          }
        }
      }),
      
      // Recent visits with basic info
      MedicalRecord.findAll({
        where: { patientFin },
        order: [['visitDate', 'DESC']],
        limit: 3,
        attributes: ['visitDate', 'visitType', 'diagnosis'],
        include: [
          {
            model: HealthCenter,
            as: 'healthCenter',
            attributes: ['name', 'city'],
            foreignKey: 'healthCenterId'
          }
        ]
      })
    ]);

    res.status(200).json({
      summary: {
        totalRecords,
        recentRecords,
        upcomingAppointments,
        activeReminders
      },
      recentVisits
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to load dashboard data'
    });
  }
});

// Mark medication reminder as taken
router.post('/medications/:reminderId/taken', [
  authenticateToken,
  requireRole(['patient']),
  auditActions.updateRecord
], async (req, res) => {
  try {
    const { reminderId } = req.params;
    const patientFin = req.user.fin;

    const reminder = await Reminder.findOne({
      where: {
        id: reminderId,
        patientFin,
        type: 'medication'
      }
    });

    if (!reminder) {
      return res.status(404).json({
        error: 'Reminder Not Found',
        message: 'Medication reminder not found'
      });
    }

    await reminder.update({
      isCompleted: true,
      completedAt: new Date()
    });

    res.status(200).json({
      message: 'Medication marked as taken',
      reminder: {
        id: reminder.id,
        title: reminder.title,
        completedAt: reminder.completedAt
      }
    });
  } catch (error) {
    console.error('Mark medication taken error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update medication status'
    });
  }
});

// Get patient's health summary
router.get('/health-summary', [
  authenticateToken,
  requireRole(['patient']),
  auditActions.viewRecord
], async (req, res) => {
  try {
    const patientFin = req.user.fin;

    // Get latest vital signs and lab results
    const latestRecord = await MedicalRecord.findOne({
      where: {
        patientFin,
        [Op.or]: [
          { vitalSigns: { [Op.ne]: null } },
          { labResults: { [Op.ne]: null } }
        ]
      },
      order: [['visitDate', 'DESC']],
      attributes: ['visitDate', 'vitalSigns', 'labResults']
    });

    // Get chronic conditions (diagnoses that appear multiple times)
    const chronicConditions = await MedicalRecord.findAll({
      where: {
        patientFin,
        diagnosis: { [Op.ne]: null }
      },
      attributes: ['diagnosis'],
      group: ['diagnosis'],
      having: sequelize.literal('COUNT(*) > 1'),
      order: [[sequelize.fn('COUNT', sequelize.col('diagnosis')), 'DESC']]
    });

    // Get current medications (from most recent prescription)
    const currentMedications = await MedicalRecord.findOne({
      where: {
        patientFin,
        medications: { [Op.ne]: null }
      },
      order: [['visitDate', 'DESC']],
      attributes: ['medications', 'visitDate']
    });

    res.status(200).json({
      latestVitals: latestRecord?.vitalSigns,
      latestLabResults: latestRecord?.labResults,
      lastCheckup: latestRecord?.visitDate,
      chronicConditions: chronicConditions.map(c => c.diagnosis),
      currentMedications: currentMedications?.medications,
      medicationsLastUpdated: currentMedications?.visitDate
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to retrieve health summary'
    });
  }
});

module.exports = router;
