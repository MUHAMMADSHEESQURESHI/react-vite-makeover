import express from 'express';
import {
  onboardUser,
  getUserById,
  getUserByEmail,
  updateTrustScore,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   POST /api/users/onboard
 * @desc    Create or update a user (onboarding flow)
 * @body    { name, email, role, skills }
 * @access  Public
 */
router.post('/onboard', onboardUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', getUserById);

/**
 * @route   GET /api/users/email/:email
 * @desc    Get user by email
 * @access  Public
 */
router.get('/email/:email', getUserByEmail);

/**
 * @route   PATCH /api/users/trust-score
 * @desc    Update user trust score
 * @body    { userId, scoreChange }
 * @access  Public
 */
router.patch('/trust-score', updateTrustScore);

export default router;
