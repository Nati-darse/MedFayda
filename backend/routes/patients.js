const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { User, Patient, HealthRecord, Appointment } = require('../models');
const { authenticateToken, authorize, canAccessPatient } = require('../middleware/auth');

const router = express.Router();

// Get all patients (admin/doctor only)
router.get('/', authenticateToken, authorize('admin', 'doctor', 'nurse'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
          { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
          { '$user.faydaId$': { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'faydaId', 'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      patients,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch patients'
    });
  }
});

// Get patient by ID
router.get('/:patientId', authenticateToken, canAccessPatient, async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findByPk(patientId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'faydaId', 'firstName', 'lastName', 'middleName', 'email', 'phoneNumber', 'dateOfBirth', 'gender']
      }]
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'Patient with this ID does not exist'
      });
    }

    res.status(200).json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch patient'
    });
  }
});

// Update patient profile
router.put('/:patientId', authenticateToken, canAccessPatient, [
  body('emergencyContactName').optional().notEmpty().withMessage('Emergency contact name cannot be empty'),
  body('emergencyContactPhone').optional().notEmpty().withMessage('Emergency contact phone cannot be empty'),
  body('emergencyContactRelation').optional().notEmpty().withMessage('Emergency contact relation cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('region').optional().notEmpty().withMessage('Region cannot be empty'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('maritalStatus').optional().isIn(['single', 'married', 'divorced', 'widowed']).withMessage('Invalid marital status')
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
    const updateData = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'Patient with this ID does not exist'
      });
    }

    await patient.update(updateData);

    const updatedPatient = await Patient.findByPk(patientId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'faydaId', 'firstName', 'lastName', 'middleName', 'email', 'phoneNumber', 'dateOfBirth', 'gender']
      }]
    });

    res.status(200).json({
      message: 'Patient profile updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update patient profile'
    });
  }
});

// Get patient's health summary
router.get('/:patientId/summary', authenticateToken, canAccessPatient, async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findByPk(patientId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'dateOfBirth', 'gender']
        },
        {
          model: HealthRecord,
          as: 'healthRecords',
          limit: 5,
          order: [['visitDate', 'DESC']],
          include: [{
            model: User,
            as: 'doctor',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Appointment,
          as: 'appointments',
          where: { status: 'scheduled' },
          required: false,
          limit: 3,
          order: [['appointmentDate', 'ASC']],
          include: [{
            model: User,
            as: 'doctor',
            attributes: ['firstName', 'lastName']
          }]
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'Patient with this ID does not exist'
      });
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(patient.user.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();

    const summary = {
      basicInfo: {
        name: patient.user.firstName + ' ' + patient.user.lastName,
        age,
        gender: patient.user.gender,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions
      },
      recentVisits: patient.healthRecords,
      upcomingAppointments: patient.appointments,
      vitalStats: {
        height: patient.height,
        weight: patient.weight,
        bmi: patient.height && patient.weight ? 
          (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1) : null
      }
    };

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Get patient summary error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch patient summary'
    });
  }
});

module.exports = router;
