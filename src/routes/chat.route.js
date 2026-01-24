const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);

router.post('/upload', upload.single('image'), chatController.uploadImage);

router.get('/conversations', chatController.getMyConversations);
router.post('/conversations', chatController.startConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.get('/unread', chatController.getUnreadCount);
router.put('/conversations/:conversationId/read', chatController.markAsRead);

module.exports = router;
