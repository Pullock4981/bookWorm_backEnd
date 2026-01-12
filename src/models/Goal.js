const mongoose = require('mongoose');

/**
 * Goal Model Schema
 * Stores user's annual reading goals.
 */
const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A goal must belong to a user']
    },
    year: {
        type: Number,
        required: [true, 'A goal must have a year'],
        default: new Date().getFullYear()
    },
    targetCount: {
        type: Number,
        required: [true, 'Please provide a target book count for the year'],
        min: [1, 'Target count must be at least 1']
    }
}, {
    timestamps: true
});

// One goal per user per year
goalSchema.index({ user: 1, year: 1 }, { unique: true });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
