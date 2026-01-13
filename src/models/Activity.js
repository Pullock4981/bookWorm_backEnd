const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['ADD_TO_READ', 'RATED_BOOK', 'FINISHED_BOOK', 'PROGRESS_LOGGED'],
        required: true
    },
    book: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book',
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed // For extra info like rating value
    }
}, {
    timestamps: true
});

// Indexes for performance
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
