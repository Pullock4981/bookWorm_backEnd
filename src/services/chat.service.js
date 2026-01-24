const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Find or create a conversation between two users
 */
const getOrCreateConversation = async (userId1, userId2) => {
    // Find conversation where both users are members
    let conversation = await Conversation.findOne({
        members: { $all: [userId1, userId2] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            members: [userId1, userId2]
        });
    }

    return conversation;
};

/**
 * Save a new message to the database
 */
const saveMessage = async (conversationId, senderId, text, image = null) => {
    const message = await Message.create({
        conversationId,
        senderId,
        text: text || "", // Ensure text is string even if empty
        image
    });

    // Update the conversation's last message and updatedAt timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text || 'Sent an image',
        updatedAt: Date.now()
    });

    return message;
};

/**
 * Get all conversations for a specific user
 */
const getUserConversations = async (userId) => {
    const conversations = await Conversation.find({ members: userId })
        .populate('members', 'name photo')
        .sort({ updatedAt: -1 })
        .lean();

    // Populate unread count for each conversation
    const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
            conversationId: conv._id,
            senderId: { $ne: userId },
            isRead: false
        });
        return { ...conv, unreadCount };
    }));

    return conversationsWithUnread;
};

/**
 * Get message history for a conversation
 */
const getMessageHistory = async (conversationId, limit = 50, skip = 0) => {
    return await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .limit(limit)
        .lean();
};

/**
 * Get total unread message count for a user
 */
const getUnreadMessageCount = async (userId) => {
    // 1. Get all conversations user is part of
    const conversations = await Conversation.find({ members: userId }, '_id');
    const conversationIds = conversations.map(c => c._id);

    // 2. Count messages in those chats where sender is NOT user and isRead is false
    const count = await Message.countDocuments({
        conversationId: { $in: conversationIds },
        senderId: { $ne: userId },
        isRead: false
    });

    return count;
};

/**
 * Mark all messages in a conversation as read for a specific user
 */
const markMessagesAsRead = async (userId, conversationId) => {
    await Message.updateMany(
        {
            conversationId,
            senderId: { $ne: userId },
            isRead: false
        },
        { $set: { isRead: true } }
    );
    return true;
};

module.exports = {
    getOrCreateConversation,
    saveMessage,
    getUserConversations,
    getMessageHistory,
    getUnreadMessageCount,
    markMessagesAsRead
};
