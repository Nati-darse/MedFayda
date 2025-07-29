const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { User, Patient, Reminder, Appointment, HealthRecord } = require('../models');
const { authenticateToken, authorize, canAccessPatient } = require('../middleware/auth');

const router = express.Router();

// Get reminders for a patient
router.get('/patient/:patientId', authenticateToken, canAccessPatient, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['appointment', 'medication', 'checkup', 'vaccination', 'lab-test', 'follow-up']).withMessage('Invalid reminder type'),
  query('status').optional().isIn(['pending', 'sent', 'acknowledged', 'dismissed']).withMessage('Invalid status'),
  query('upcoming').optional().isBoolean().withMessage('Upcoming must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;
    const upcoming = req.query.upcoming === 'true';

    let whereClause = { patientId };
    if (type) {
      whereClause.type = type;
    }
    if (status) {
      whereClause.status = status;
    }
    if (upcoming) {
      whereClause.reminderDate = {
        [Op.gte]: new Date()
      };
    }

    const { count, rows: reminders } = await Reminder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Appointment,
          as: 'relatedAppointment',
          required: false,
          include: [{
            model: User,
            as: 'doctor',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: HealthRecord,
          as: 'relatedHealthRecord',
          required: false,
          include: [{
            model: User,
            as: 'doctor',
            attributes: ['firstName', 'lastName']
          }]
        }
      ],
      limit,
      offset,
      order: [['reminderDate', upcoming ? 'ASC' : 'DESC']]
    });

    res.status(200).json({
      reminders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch reminders'
    });
  }
});

// Create new reminder
router.post('/', authenticateToken, authorize('doctor', 'nurse', 'admin'), [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('type').isIn(['appointment', 'medication', 'checkup', 'vaccination', 'lab-test', 'follow-up']).withMessage('Valid reminder type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('reminderDate').isISO8601().withMessage('Valid reminder date is required'),
  body('method').optional().isIn(['sms', 'email', 'push', 'all']).withMessage('Invalid reminder method'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurringPattern').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurring pattern')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const {
      patientId,
      type,
      title,
      description,
      scheduledDate,
      reminderDate,
      isRecurring = false,
      recurringPattern,
      recurringInterval = 1,
      method = 'sms',
      priority = 'medium',
      relatedAppointmentId,
      relatedHealthRecordId
    } = req.body;

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'Patient with this ID does not exist'
      });
    }

    // Verify related appointment if provided
    if (relatedAppointmentId) {
      const appointment = await Appointment.findByPk(relatedAppointmentId);
      if (!appointment || appointment.patientId !== patientId) {
        return res.status(400).json({
          error: 'Invalid Appointment',
          message: 'Related appointment does not exist or does not belong to this patient'
        });
      }
    }

    // Verify related health record if provided
    if (relatedHealthRecordId) {
      const healthRecord = await HealthRecord.findByPk(relatedHealthRecordId);
      if (!healthRecord || healthRecord.patientId !== patientId) {
        return res.status(400).json({
          error: 'Invalid Health Record',
          message: 'Related health record does not exist or does not belong to this patient'
        });
      }
    }

    const reminder = await Reminder.create({
      patientId,
      type,
      title,
      description,
      scheduledDate,
      reminderDate,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : null,
      recurringInterval: isRecurring ? recurringInterval : null,
      method,
      priority,
      relatedAppointmentId,
      relatedHealthRecordId
    });

    const createdReminder = await Reminder.findByPk(reminder.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Appointment,
          as: 'relatedAppointment',
          required: false
        },
        {
          model: HealthRecord,
          as: 'relatedHealthRecord',
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder: createdReminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to create reminder'
    });
  }
});

// Update reminder status
router.put('/:reminderId/status', authenticateToken, [
  body('status').isIn(['pending', 'sent', 'acknowledged', 'dismissed']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { reminderId } = req.params;
    const { status } = req.body;

    const reminder = await Reminder.findByPk(reminderId);
    if (!reminder) {
      return res.status(404).json({
        error: 'Reminder Not Found',
        message: 'Reminder with this ID does not exist'
      });
    }

    // Check permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || reminder.patientId !== patient.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own reminders'
        });
      }
    }

    const updateData = { status };
    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'acknowledged') {
      updateData.acknowledgedAt = new Date();
    }

    await reminder.update(updateData);

    const updatedReminder = await Reminder.findByPk(reminderId, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }
      ]
    });

    res.status(200).json({
      message: 'Reminder status updated successfully',
      reminder: updatedReminder
    });
  } catch (error) {
    console.error('Update reminder status error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update reminder status'
    });
  }
});

// Get pending reminders (for system processing)
router.get('/pending', authenticateToken, authorize('admin', 'system'), async (req, res) => {
  try {
    const now = new Date();
    
    const pendingReminders = await Reminder.findAll({
      where: {
        status: 'pending',
        reminderDate: {
          [Op.lte]: now
        }
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phoneNumber', 'email']
          }]
        }
      ],
      order: [['priority', 'DESC'], ['reminderDate', 'ASC']]
    });

    res.status(200).json({ reminders: pendingReminders });
  } catch (error) {
    console.error('Get pending reminders error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch pending reminders'
    });
  }
});

module.exports = router;
