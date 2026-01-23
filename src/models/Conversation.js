const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups of conversations between two users
conversationSchema.index({ members: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
