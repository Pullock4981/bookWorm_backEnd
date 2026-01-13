const express = require('express');
const feedController = require('../controllers/feed.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Public or Protected? Let's make it protected to encourage login
router.use(protect);

router.get('/', feedController.getGlobalFeed);

module.exports = router;
