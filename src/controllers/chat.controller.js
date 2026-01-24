const chatService = require('../services/chat.service');
const catchAsync = require('../utils/catchAsync');

const uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new Error('Please upload an image');
    }
    // Cloudinary storage returns path/url in req.file.path
    res.status(200).json({
        status: 'success',
        url: req.file.path
    });
});

/**
 * Get all conversations for the logged-in user
 */
const getMyConversations = async (req, res) => {
    try {
        const conversations = await chatService.getUserConversations(req.user._id);
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get or create a conversation with another user
 */
const startConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;
        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient ID is required' });
        }

        const conversation = await chatService.getOrCreateConversation(req.user._id, recipientId);
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get message history for a specific conversation
 */
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit, skip } = req.query;

        const messages = await chatService.getMessageHistory(
            conversationId,
            parseInt(limit) || 50,
            parseInt(skip) || 0
        );

        res.status(200).json(messages.reverse()); // Reverse to get chronological order
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get total unread message count
 */
const getUnreadCount = async (req, res) => {
    try {
        const count = await chatService.getUnreadMessageCount(req.user._id);
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Mark conversation messages as read
 */
const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await chatService.markMessagesAsRead(req.user._id, conversationId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyConversations,
    startConversation,
    startConversation,
    getMessages,
    getUnreadCount,
    markAsRead,
    uploadImage
};
