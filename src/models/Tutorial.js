const mongoose = require('mongoose');

/**
 * Tutorial Model Schema
 * Represents a video tutorial or guide (e.g., YouTube link) for the platform.
 */
const tutorialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A tutorial must have a title'],
        trim: true
    },
    videoUrl: {
        type: String,
        required: [true, 'A tutorial must have a video URL'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

module.exports = Tutorial;
