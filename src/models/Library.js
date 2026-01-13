const mongoose = require('mongoose');

/**
 * Library Model Schema
 * Tracks user's personal book collection, reading shelves, and progress.
 */
const librarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Library entry must belong to a user']
    },
    book: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book',
        required: [true, 'Library entry must belong to a book']
    },
    shelf: {
        type: String,
        enum: ['Want to Read', 'Currently Reading', 'Read'],
        required: [true, 'Shelf name is required']
    },
    pagesRead: {
        type: Number,
        default: 0,
        min: [0, 'Pages read cannot be negative']
    },
    totalPages: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure a user can only have one library record per book
librarySchema.index({ user: 1, book: 1 }, { unique: true });

/**
 * Middleware: Automatically populate book info when fetching library records
 */
librarySchema.pre(/^find/, function () {
    this.populate({
        path: 'book',
        select: 'title author coverImage genre totalPages averageRating pdfUrl'
    });
});

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;
