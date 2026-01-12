const express = require('express');
const statsController = require('../controllers/stats.controller');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// All stats routes require login
router.use(protect);

router.get('/me', statsController.getMyStats);
router.post('/goal', statsController.updateGoal);
router.get('/admin', restrictTo('Admin'), statsController.getAdminStats);

module.exports = router;
