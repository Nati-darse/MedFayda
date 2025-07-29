const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { User, Patient } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['patient', 'doctor', 'nurse', 'admin', 'receptionist']).withMessage('Invalid role'),
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
    const role = req.query.role;
    const search = req.query.search;

    let whereClause = {};
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { faydaId: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch users'
    });
  }
});

// Get doctors list
router.get('/doctors', authenticateToken, async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: {
        role: 'doctor',
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
      order: [['firstName', 'ASC']]
    });

    res.status(200).json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch doctors'
    });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only access their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own profile'
      });
    }

    const user = await User.findByPk(userId, {
      include: [{
        model: Patient,
        as: 'patientProfile',
        required: false
      }],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User with this ID does not exist'
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to fetch user'
    });
  }
});

// Update user profile
router.put('/:userId', authenticateToken, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('role').optional().isIn(['patient', 'doctor', 'nurse', 'admin', 'receptionist']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const updateData = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile'
      });
    }

    // Only admin can change roles
    if (updateData.role && req.user.role !== 'admin') {
      delete updateData.role;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User with this ID does not exist'
      });
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Patient,
        as: 'patientProfile',
        required: false
      }],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to update user profile'
    });
  }
});

// Deactivate user (admin only)
router.put('/:userId/deactivate', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User with this ID does not exist'
      });
    }

    await user.update({ isActive: false });

    res.status(200).json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to deactivate user'
    });
  }
});

// Activate user (admin only)
router.put('/:userId/activate', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User with this ID does not exist'
      });
    }

    await user.update({ isActive: true });

    res.status(200).json({
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Unable to activate user'
    });
  }
});

module.exports = router;
