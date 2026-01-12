const statsService = require('../services/stats.service');

/**
 * Controller to handle Stats & Goals requests
 */

/**
 * Retrieves the logged-in user's reading statistics
 */
const getMyStats = async (req, res) => {
    try {
        const stats = await statsService.getUserStats(req.user._id);
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Updates the user's annual reading goal
 */
const updateGoal = async (req, res) => {
    try {
        const { targetCount } = req.body;
        if (!targetCount) throw new Error('Target count is required');

        const goal = await statsService.setGoal(req.user._id, targetCount);
        res.status(200).json({
            status: 'success',
            data: goal
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Retrieves admin dashboard statistics
 */
const getAdminStats = async (req, res) => {
    try {
        const stats = await statsService.getAdminStats();
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    getMyStats,
    updateGoal,
    getAdminStats
};
