const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/conversations', chatController.getMyConversations);
router.post('/conversations', chatController.startConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.get('/unread', chatController.getUnreadCount);
router.put('/conversations/:conversationId/read', chatController.markAsRead);

module.exports = router;
