const express = require('express');
const tutorialController = require('../controllers/tutorial.controller');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

/**
 * Public Routes: View tutorials (Requires login or can be fully public based on preference)
 */
router.get('/', protect, tutorialController.getAllTutorials);

/**
 * Admin Only Routes: Manage tutorials
 */
router.use(protect, restrictTo('Admin'));

router.post('/', tutorialController.createTutorial);
router.patch('/:id', tutorialController.updateTutorial);
router.delete('/:id', tutorialController.deleteTutorial);

module.exports = router;
