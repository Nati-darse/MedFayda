const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { MedicalRecord, User, HealthCenter } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditActions } = require('../middleware/auditLog');
const router = express.Router();

// Get patient medical records by FIN (for doctors and lab technicians)
router.get('/patient/:fin', [
  authenticateToken,
  requireRole(['doctor', 'lab_technician', 'nurse']),
  param('fin').isLength({ min: 10, max: 15 }).withMessage('Invalid FIN format'),
  auditActions.viewRecord
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { fin } = req.params;
    const { page = 1, limit = 20, startDate, endDate, visitType } = req.query;

    // Build query conditions
    const whereConditions = { patientFin: fin };
    
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
          attributes: ['fin', 'firstName', 'lastName', 'specialization'],
          foreignKey: 'doctorFin',
          sourceKey: 'fin'
        },
        {
          model: HealthCenter,
          as: 'healthCenter',
          attributes: ['id', 'name', 'type', 'city'],
          foreignKey: 'healthCenterId'
        }
      ]
    });

    // Get patient basic info
    const patient = await User.findOne({
      where: { fin },
      attributes: ['fin', 'firstName', 'lastName', 'dateOfBirth', 'gender']
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'No patient found with the provided FIN'
      });
    }

    res.status(200).json({
      patient,
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
      message: 'Unable to retrieve patient medical records'
    });
  }
});

// Create new medical record
router.post('/patient/:fin', [
  authenticateToken,
  requireRole(['doctor']),
  param('fin').isLength({ min: 10, max: 15 }).withMessage('Invalid FIN format'),
  body('visitType').isIn(['consultation', 'emergency', 'follow_up', 'lab_test', 'surgery', 'vaccination']),
  body('chiefComplaint').optional().isLength({ max: 1000 }),
  body('diagnosis').optional().isLength({ max: 2000 }),
  body('treatment').optional().isLength({ max: 2000 }),
  body('notes').optional().isLength({ max: 2000 }),
  auditActions.createRecord
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { fin } = req.params;
    const {
      visitType,
      chiefComplaint,
      diagnosis,
      treatment,
      medications,
      labResults,
      vitalSigns,
      notes,
      followUpDate,
      isEmergency = false
    } = req.body;

    // Verify patient exists
    const patient = await User.findOne({ where: { fin, role: 'patient' } });
    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'No patient found with the provided FIN'
      });
    }

    // Create medical record
    const record = await MedicalRecord.create({
      patientFin: fin,
      doctorFin: req.user.fin,
      healthCenterId: req.user.healthCenterId,
      visitDate: new Date(),
      visitType,
      chiefComplaint,
      diagnosis,
      treatment,
      medications,
      labResults,
      vitalSigns,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      isEmergency
    });

    res.status(201).json({
      message: 'Medical record created successfully',
      record: {
        id: record.id,
        visitDate: record.visitDate,
        visitType: record.visitType,
        diagnosis: record.diagnosis,
        treatment: record.treatment
      }
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to create medical record'
    });
  }
});

// Update medical record (only by the doctor who created it)
router.put('/:recordId', [
  authenticateToken,
  requireRole(['doctor']),
  param('recordId').isUUID().withMessage('Invalid record ID'),
  auditActions.updateRecord
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

    // Find the record
    const record = await MedicalRecord.findByPk(recordId);
    if (!record) {
      return res.status(404).json({
        error: 'Record Not Found',
        message: 'Medical record not found'
      });
    }

    // Check if the current user is the doctor who created the record
    if (record.doctorFin !== req.user.fin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only update records you created'
      });
    }

    // Update the record
    await record.update(updateData);

    res.status(200).json({
      message: 'Medical record updated successfully',
      record: {
        id: record.id,
        visitDate: record.visitDate,
        visitType: record.visitType,
        diagnosis: record.diagnosis,
        treatment: record.treatment
      }
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update medical record'
    });
  }
});

// Add lab results (for lab technicians)
router.post('/:recordId/lab-results', [
  authenticateToken,
  requireRole(['lab_technician', 'doctor']),
  param('recordId').isUUID().withMessage('Invalid record ID'),
  body('results').isObject().withMessage('Lab results must be an object'),
  auditActions.updateRecord
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
    const { results, notes } = req.body;

    // Find the record
    const record = await MedicalRecord.findByPk(recordId);
    if (!record) {
      return res.status(404).json({
        error: 'Record Not Found',
        message: 'Medical record not found'
      });
    }

    // Update lab results
    const updatedLabResults = {
      ...record.labResults,
      ...results,
      updatedBy: req.user.fin,
      updatedAt: new Date(),
      notes
    };

    await record.update({ labResults: updatedLabResults });

    res.status(200).json({
      message: 'Lab results added successfully',
      labResults: updatedLabResults
    });
  } catch (error) {
    console.error('Add lab results error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to add lab results'
    });
  }
});

// Search patients by name or FIN (for medical professionals)
router.get('/search', [
  authenticateToken,
  requireRole(['doctor', 'lab_technician', 'nurse']),
  query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  auditActions.searchPatient
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { q, limit = 10 } = req.query;

    // Search patients by FIN, first name, or last name
    const patients = await User.findAll({
      where: {
        role: 'patient',
        [Op.or]: [
          { fin: { [Op.iLike]: `%${q}%` } },
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } }
        ]
      },
      attributes: ['fin', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
      limit: parseInt(limit)
    });

    res.status(200).json({
      patients,
      count: patients.length
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to search patients'
    });
  }
});

module.exports = router;
