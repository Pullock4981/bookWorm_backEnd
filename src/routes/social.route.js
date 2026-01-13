const express = require('express');
const socialController = require('../controllers/social.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All social routes are protected
router.use(protect);

router.post('/follow/:id', socialController.followUser);
router.post('/unfollow/:id', socialController.unfollowUser);
router.get('/feed', socialController.getFeed);
router.get('/users-to-follow', socialController.getSuggestedUsers);
router.get('/following', socialController.getFollowing);

module.exports = router;
