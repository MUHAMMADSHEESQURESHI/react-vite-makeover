import User from '../models/User.js';
import HelpRequest from '../models/HelpRequest.js';

/**
 * Get leaderboard of top helpers
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, role } = req.query;

    const filter = {};
    if (role) {
      filter.role = { $in: [role, 'both'] };
    }

    // Get top users by trust score
    const topHelpers = await User.find(filter)
      .select('name email role skills trustScore')
      .sort({ trustScore: -1 })
      .limit(parseInt(limit));

    // Calculate additional stats for each helper
    const leaderboard = await Promise.all(
      topHelpers.map(async (user) => {
        const solvedCount = await HelpRequest.countDocuments({
          assignedTo: user._id,
          status: 'solved',
        });

        const activeCount = await HelpRequest.countDocuments({
          assignedTo: user._id,
          status: 'open',
        });

        return {
          rank: 0, // Will be set after mapping
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills,
          },
          stats: {
            trustScore: user.trustScore,
            solvedRequests: solvedCount,
            activeRequests: activeCount,
          },
        };
      })
    );

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard',
      error: error.message,
    });
  }
};

/**
 * Get community stats
 */
export const getCommunityStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await HelpRequest.countDocuments();
    const solvedRequests = await HelpRequest.countDocuments({ status: 'solved' });
    const openRequests = await HelpRequest.countDocuments({ status: 'open' });

    const helpers = await User.countDocuments({
      role: { $in: ['can-help', 'both'] },
    });
    const seekers = await User.countDocuments({
      role: { $in: ['need-help', 'both'] },
    });

    const avgTrustScore = await User.aggregate([
      { $group: { _id: null, avg: { $avg: '$trustScore' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRequests,
        solvedRequests,
        openRequests,
        helpers,
        seekers,
        averageTrustScore: avgTrustScore[0]?.avg?.toFixed(2) || 100,
        successRate: totalRequests > 0 ? ((solvedRequests / totalRequests) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community stats',
      error: error.message,
    });
  }
};
