import HelpRequest from '../models/HelpRequest.js';
import User from '../models/User.js';
import { analyzeRequest } from '../utils/aiAssistant.js';

/**
 * Create a new help request
 */
export const createHelpRequest = async (req, res) => {
  try {
    console.log('--- NEW REQUEST RECEIVED ---', req.body);
    const { title, description, tags, category, urgency, status, createdBy } = req.body;

    // Validate required fields with clear error messages
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required and cannot be empty',
      });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Description is required and cannot be empty',
      });
    }
    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: 'createdBy (userId) is required. Ensure you are logged in.',
      });
    }

    // Verify user exists (skip for demo users with 'demo-' prefix)
    if (!createdBy.startsWith('demo-')) {
      const user = await User.findById(createdBy);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Invalid userId.',
        });
      }
    }

    // AI-powered analysis if description provided
    let aiAnalysis = {};
    if (description) {
      aiAnalysis = await analyzeRequest(description);
      console.log('AI Analysis:', aiAnalysis);
    }

    // Create help request with AI-enhanced data
    const helpRequest = await HelpRequest.create({
      title,
      description,
      tags: tags || aiAnalysis.tags || [],
      category: category || aiAnalysis.category || 'other',
      urgency: urgency || aiAnalysis.urgency || 'medium',
      status: status || 'open',
      aiSummary: aiAnalysis.summary || '',
      createdBy,
    });

    // For demo users, return data with mock user info from request body
    const isDemoUser = createdBy.startsWith('demo-');
    let responseData;
    if (isDemoUser) {
      const userName = req.body.userName || 'Demo User';
      const userEmail = req.body.userEmail || 'demo@example.com';
      responseData = {
        ...helpRequest.toObject(),
        createdBy: {
          name: userName,
          email: userEmail,
        },
      };
    } else {
      responseData = await HelpRequest.findById(helpRequest._id).populate('createdBy', 'name email');
    }

    res.status(201).json({
      success: true,
      message: 'Help request created successfully',
      data: responseData,
      aiAnalysis,
    });
  } catch (error) {
    console.error('Create help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating help request',
      error: error.message,
    });
  }
};

/**
 * Get all help requests with optional filters
 */
export const getHelpRequests = async (req, res) => {
  try {
    const { status, category, urgency, createdBy } = req.query;

    console.log('--- FETCHING REQUESTS ---');
    console.log('Filters:', { status, category, urgency, createdBy });

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (createdBy) filter.createdBy = createdBy;

    const helpRequests = await HelpRequest.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    console.log('Found', helpRequests.length, 'requests');

    res.status(200).json({
      success: true,
      count: helpRequests.length,
      data: helpRequests,
    });
  } catch (error) {
    console.error('Get help requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching help requests',
      error: error.message,
    });
  }
};

/**
 * Get a single help request by ID
 */
export const getHelpRequestById = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('createdBy', 'name email role trustScore')
      .populate('assignedTo', 'name email');

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: helpRequest,
    });
  } catch (error) {
    console.error('Get help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching help request',
      error: error.message,
    });
  }
};

/**
 * Update help request status
 */
export const updateHelpRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['open', 'solved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "open" or "solved"',
      });
    }

    const helpRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found',
      });
    }

    // Update trust score if marked as solved
    if (status === 'solved' && helpRequest.assignedTo) {
      await User.findByIdAndUpdate(helpRequest.assignedTo, {
        $inc: { trustScore: 5 },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Help request status updated',
      data: helpRequest,
    });
  } catch (error) {
    console.error('Update help request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating help request status',
      error: error.message,
    });
  }
};

/**
 * Assign a helper to a help request
 */
export const assignHelper = async (req, res) => {
  try {
    const { helperId } = req.body;

    if (!helperId) {
      return res.status(400).json({
        success: false,
        message: 'helperId is required',
      });
    }

    const helper = await User.findById(helperId);
    if (!helper) {
      return res.status(404).json({
        success: false,
        message: 'Helper not found',
      });
    }

    const helpRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { assignedTo: helperId, status: 'open' },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('assignedTo', 'name email');

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Helper assigned successfully',
      data: helpRequest,
    });
  } catch (error) {
    console.error('Assign helper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error assigning helper',
      error: error.message,
    });
  }
};
