const mongoose = require('mongoose');

/**
 * Review Model Schema
 * Handles book ratings and user reviews with an approval status.
 */
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review text cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating between 1 and 5']
    },
    book: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book',
        required: [true, 'Review must belong to a book.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved'],
        default: 'Pending'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Allow multiple reviews: A user can review a book multiple times if they wish.
reviewSchema.index({ book: 1, user: 1 }, { unique: false });

/**
 * Query Middleware: Automatically populate user information
 */
reviewSchema.pre(/^find/, function () {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
});

/**
 * Static method to calculate Average Rating and Total Reviews for a book.
 * This will be called whenever a review is saved or updated.
 */
reviewSchema.statics.calcAverageRatings = async function (bookId) {
    const stats = await this.aggregate([
        {
            $match: { book: bookId, status: 'Approved' }
        },
        {
            $group: {
                _id: '$book',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Book').findByIdAndUpdate(bookId, {
            totalReviews: stats[0].nRating,
            averageRating: Math.round(stats[0].avgRating * 10) / 10
        });
    } else {
        await mongoose.model('Book').findByIdAndUpdate(bookId, {
            totalReviews: 0,
            averageRating: 0
        });
    }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.book);
});

// For update/delete operations (Admin moderation)
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) await doc.constructor.calcAverageRatings(doc.book);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
