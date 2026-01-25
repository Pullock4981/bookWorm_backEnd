const express = require('express');
const socialController = require('../controllers/social.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All social routes are protected
router.use(protect);

router.post('/follow/:id', socialController.followUser);
router.post('/unfollow/:id', socialController.unfollowUser);
router.get('/feed', socialController.getFeed);
router.get('/activity/:userId', socialController.getUserActivity);
router.post('/activity/:id/like', socialController.toggleLike);
router.post('/activity/:id/comment', socialController.addComment);
router.get('/users-to-follow', socialController.getSuggestedUsers);
router.get('/following', socialController.getFollowing);
router.get('/search', socialController.searchUsers);

module.exports = router;
