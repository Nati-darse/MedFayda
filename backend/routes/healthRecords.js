const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { User, Patient, HealthRecord } = require('../models');
const { authenticateToken, authorize, canAccessPatient } = require('../middleware/auth');

const router = express.Router();

// Get health records for a patient
router.get('/patient/:patientId', authenticateToken, canAccessPatient, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('visitType').optional().isIn(['consultation', 'emergency', 'follow-up', 'routine-checkup', 'surgery', 'diagnostic']).withMessage('Invalid visit type')
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
    const visitType = req.query.visitType;

    let whereClause = { patientId };
    if (visitType) {
      whereClause.visitType = visitType;
    }

    const { count, rows: healthRecords } = await HealthRecord.findAndCountAll({
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
      order: [['visitDate', 'DESC']]
    });

    res.status(200).json({
      healthRecords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch health records'
    });
  }
});

// Get specific health record
router.get('/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    const healthRecord = await HealthRecord.findByPk(recordId, {
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
            attributes: ['firstName', 'lastName', 'faydaId']
          }]
        }
      ]
    });

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health Record Not Found',
        message: 'Health record with this ID does not exist'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || healthRecord.patientId !== patient.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own health records'
        });
      }
    }

    res.status(200).json({ healthRecord });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch health record'
    });
  }
});

// Create new health record (doctors only)
router.post('/', authenticateToken, authorize('doctor'), [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('visitType').isIn(['consultation', 'emergency', 'follow-up', 'routine-checkup', 'surgery', 'diagnostic']).withMessage('Valid visit type is required'),
  body('chiefComplaint').notEmpty().withMessage('Chief complaint is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('hospitalName').notEmpty().withMessage('Hospital name is required'),
  body('vitalSigns').optional().isObject().withMessage('Vital signs must be an object'),
  body('prescriptions').optional().isArray().withMessage('Prescriptions must be an array')
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
      visitType,
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      vitalSigns,
      diagnosis,
      treatmentPlan,
      prescriptions,
      labResults,
      imagingResults,
      followUpDate,
      followUpInstructions,
      notes,
      hospitalName,
      department
    } = req.body;

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'Patient with this ID does not exist'
      });
    }

    const healthRecord = await HealthRecord.create({
      patientId,
      doctorId: req.user.id,
      visitType,
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      vitalSigns,
      diagnosis,
      treatmentPlan,
      prescriptions,
      labResults,
      imagingResults,
      followUpDate,
      followUpInstructions,
      notes,
      hospitalName,
      department
    });

    const createdRecord = await HealthRecord.findByPk(healthRecord.id, {
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
      message: 'Health record created successfully',
      healthRecord: createdRecord
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to create health record'
    });
  }
});

// Update health record (doctors only)
router.put('/:recordId', authenticateToken, authorize('doctor'), [
  body('visitType').optional().isIn(['consultation', 'emergency', 'follow-up', 'routine-checkup', 'surgery', 'diagnostic']).withMessage('Valid visit type is required'),
  body('vitalSigns').optional().isObject().withMessage('Vital signs must be an object'),
  body('prescriptions').optional().isArray().withMessage('Prescriptions must be an array'),
  body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { recordId } = req.params;
    const updateData = req.body;

    const healthRecord = await HealthRecord.findByPk(recordId);
    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health Record Not Found',
        message: 'Health record with this ID does not exist'
      });
    }

    // Only the doctor who created the record can update it (or admin)
    if (req.user.role !== 'admin' && healthRecord.doctorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own health records'
      });
    }

    await healthRecord.update(updateData);

    const updatedRecord = await HealthRecord.findByPk(recordId, {
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
      message: 'Health record updated successfully',
      healthRecord: updatedRecord
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update health record'
    });
  }
});

module.exports = router;
