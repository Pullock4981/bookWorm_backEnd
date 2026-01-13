const mongoose = require('mongoose');

/**
 * Book Model Schema
 * Represents a book in the system with its metadata and association to a Genre.
 */
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A book must have a title'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'A book must have an author'],
        trim: true
    },
    genre: {
        type: mongoose.Schema.ObjectId,
        ref: 'Genre',
        required: [true, 'A book must belong to a genre']
    },
    description: {
        type: String,
        required: [true, 'A book must have a description']
    },
    coverImage: {
        type: String,
        required: [true, 'A book must have a cover image']
    },
    pdfUrl: {
        type: String,
        required: [true, 'A book must have a PDF file']
    },
    totalPages: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be above 0'],
        max: [5, 'Rating must be below 5']
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
bookSchema.index({ genre: 1 });
bookSchema.index({ averageRating: -1, totalReviews: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ title: 'text', author: 'text' });

/**
 * Query Middleware: Automatically populate the genre name when fetching books
 */
bookSchema.pre(/^find/, function () {
    this.populate({
        path: 'genre',
        select: 'name'
    });
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
