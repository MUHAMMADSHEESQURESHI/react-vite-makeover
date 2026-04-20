import express from 'express';
import {
  getLeaderboard,
  getCommunityStats,
} from '../controllers/leaderboardController.js';

const router = express.Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Get top helpers ranked by trust score
 * @query   { limit?, role? }
 * @access  Public
 */
router.get('/', getLeaderboard);

/**
 * @route   GET /api/leaderboard/stats
 * @desc    Get community-wide statistics
 * @access  Public
 */
router.get('/stats', getCommunityStats);

export default router;
