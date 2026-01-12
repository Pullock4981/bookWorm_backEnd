const recommendationService = require('../services/recommendation.service');

/**
 * Controller to handle recommendation requests
 */

/**
 * Fetches personalized recommendations for the logged-in user
 */
const getRecommendations = async (req, res) => {
    try {
        const recommendations = await recommendationService.getPersonalizedRecommendations(req.user._id);
        res.status(200).json({
            status: 'success',
            results: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    getRecommendations
};
