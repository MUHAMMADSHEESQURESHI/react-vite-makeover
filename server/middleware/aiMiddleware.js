import { analyzeRequest } from '../utils/aiAssistant.js';

/**
 * Middleware to auto-detect urgency and category from request body
 * Expects { description } in req.body
 * Adds urgency, category, and tags to req.body if not provided
 */
export const autoDetectRequestMetadata = async (req, res, next) => {
  const { description, urgency, category, tags } = req.body;

  if (description && typeof description === 'string') {
    const analysis = await analyzeRequest(description);

    // Only auto-fill if not explicitly provided
    if (!urgency) {
      req.body.urgency = analysis.urgency;
    }
    if (!category) {
      req.body.category = analysis.category;
    }
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      req.body.tags = analysis.tags;
    }
  }

  next();
};
