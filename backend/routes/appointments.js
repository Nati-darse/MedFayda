const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { User, Patient, Appointment } = require('../models');
const { authenticateToken, authorize, canAccessPatient } = require('../middleware/auth');

const router = express.Router();

// Get appointments for a patient
router.get('/patient/:patientId', authenticateToken, canAccessPatient, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
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
    const status = req.query.status;
    const upcoming = req.query.upcoming === 'true';

    let whereClause = { patientId };
    if (status) {
      whereClause.status = status;
    }
    if (upcoming) {
      whereClause.appointmentDate = {
        [Op.gte]: new Date()
      };
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }
      ],
      limit,
      offset,
      order: [['appointmentDate', upcoming ? 'ASC' : 'DESC']]
    });

    res.status(200).json({
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch appointments'
    });
  }
});

// Get appointments for a doctor
router.get('/doctor/:doctorId', authenticateToken, authorize('doctor', 'admin'), [
  query('date').optional().isISO8601().withMessage('Date must be in ISO format'),
  query('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { doctorId } = req.params;
    const date = req.query.date;
    const status = req.query.status;

    // Check if user can access this doctor's appointments
    if (req.user.role === 'doctor' && req.user.id !== doctorId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own appointments'
      });
    }

    let whereClause = { doctorId };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.appointmentDate = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      };
    }
    if (status) {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phoneNumber']
          }]
        }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch doctor appointments'
    });
  }
});

// Create new appointment
router.post('/', authenticateToken, [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('doctorId').isUUID().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid appointment time is required (HH:MM format)'),
  body('type').isIn(['consultation', 'follow-up', 'routine-checkup', 'emergency', 'surgery', 'diagnostic']).withMessage('Valid appointment type is required'),
  body('reason').notEmpty().withMessage('Reason for appointment is required'),
  body('hospitalName').notEmpty().withMessage('Hospital name is required'),
  body('duration').optional().isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes')
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
      doctorId,
      appointmentDate,
      appointmentTime,
      type,
      reason,
      notes,
      hospitalName,
      department,
      duration = 30
    } = req.body;

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'Patient with this ID does not exist'
      });
    }

    // Verify doctor exists
    const doctor = await User.findOne({ 
      where: { id: doctorId, role: 'doctor', isActive: true } 
    });
    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor Not Found',
        message: 'Doctor with this ID does not exist or is not active'
      });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: {
          [Op.notIn]: ['cancelled', 'no-show', 'completed']
        }
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        error: 'Scheduling Conflict',
        message: 'Doctor already has an appointment at this time'
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      duration,
      type,
      reason,
      notes,
      hospitalName,
      department
    });

    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName']
        },
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

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: createdAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to create appointment'
    });
  }
});

// Update appointment status
router.put('/:appointmentId/status', authenticateToken, [
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Valid status is required'),
  body('cancellationReason').optional().notEmpty().withMessage('Cancellation reason cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { appointmentId } = req.params;
    const { status, cancellationReason } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment Not Found',
        message: 'Appointment with this ID does not exist'
      });
    }

    // Check permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || appointment.patientId !== patient.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own appointments'
        });
      }
    } else if (req.user.role === 'doctor' && appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own appointments'
      });
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancelledBy = req.user.id;
      updateData.cancelledAt = new Date();
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }

    await appointment.update(updateData);

    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName']
        },
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
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update appointment status'
    });
  }
});

module.exports = router;
