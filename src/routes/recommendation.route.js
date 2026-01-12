const express = require('express');
const recommendationController = require('../controllers/recommendation.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

/**
 * Get personalized recommendations (Requires login)
 */
router.get('/', protect, recommendationController.getRecommendations);

module.exports = router;
