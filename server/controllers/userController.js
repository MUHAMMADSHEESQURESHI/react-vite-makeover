import User from '../models/User.js';

/**
 * Create or update a user (onboarding)
 */
export const onboardUser = async (req, res) => {
  try {
    const { name, email, role, skills } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Validate role
    const validRoles = ['need-help', 'can-help', 'both'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: need-help, can-help, both',
      });
    }

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.role = role || user.role;
      user.skills = skills || user.skills;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      role: role || 'need-help',
      skills: skills || [],
    });

    res.status(201).json({
      success: true,
      message: 'User onboarded successfully',
      data: user,
    });
  } catch (error) {
    console.error('Onboard user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user onboarding',
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user',
      error: error.message,
    });
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user',
      error: error.message,
    });
  }
};

/**
 * Update user trust score
 */
export const updateTrustScore = async (req, res) => {
  try {
    const { userId, scoreChange } = req.body;

    if (!userId || typeof scoreChange !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'userId and scoreChange are required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update trust score (clamp between 0 and 100)
    user.trustScore = Math.max(0, Math.min(100, user.trustScore + scoreChange));
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Trust score updated',
      data: user,
    });
  } catch (error) {
    console.error('Update trust score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating trust score',
      error: error.message,
    });
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role skills trustScore');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message,
    });
  }
};
