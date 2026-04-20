import express from 'express';
import { createHelpRequest, getHelpRequests, getHelpRequestById, updateHelpRequestStatus, assignHelper, } from '../controllers/helpRequestController.js';
import { autoDetectRequestMetadata } from '../middleware/aiMiddleware.js';
import { analyzeRequest } from '../utils/aiAssistant.js';

const router = express.Router();

/**
 * @route   POST /api/help-requests
 * @desc    Create a new help request (with AI auto-detection)
 * @body    { title, description, tags?, category?, urgency?, status?, createdBy }
 * @access  Public
 */
router.post('/', (req, res, next) => {
  console.log('=== POST /api/help-requests ===');
  console.log('Incoming Data:', req.body);
  next();
}, autoDetectRequestMetadata, createHelpRequest);

/**
 * @route   GET /api/help-requests
 * @desc    Get all help requests with optional filters, sorted by newest first
 * @query   { status?, category?, urgency?, createdBy? }
 * @access  Public
 */
router.get('/', (req, res, next) => {
  console.log('=== GET /api/help-requests ===');
  console.log('Query params:', req.query);
  next();
}, getHelpRequests);

/**
 * @route   GET /api/help-requests/:id
 * @desc    Get a single help request by ID
 * @access  Public
 */
router.get('/:id', getHelpRequestById);

/**
 * @route   PATCH /api/help-requests/:id/status
 * @desc    Update help request status (open/solved)
 * @body    { status }
 * @access  Public
 */
router.patch('/:id/status', updateHelpRequestStatus);

/**
 * @route   PATCH /api/help-requests/:id/assign
 * @desc    Assign a helper to a help request
 * @body    { helperId }
 * @access  Public
 */
router.patch('/:id/assign', assignHelper);

  /**
   * @route   POST /api/help-requests/analyze
   * @desc    Analyze a description and return AI-suggested category, urgency, and tags
   * @body    { description }
   * @access  Public
   */
  router.post('/analyze', async (req, res) => {
    console.log('=== POST /api/help-requests/analyze ===');
    console.log('Description to analyze:', req.body.description);

    try {
      const analysis = await analyzeRequest(req.body.description);
      console.log('AI Analysis result:', analysis);

      res.status(200).json({
        success: true,
        aiAnalysis: analysis,
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'AI analysis failed',
        error: error.message,
      });
    }
  });

export default router;
