const Review = require('../models/Review');
const socialService = require('./social.service');

/**
 * Service to handle Book Reviews business logic
 */

/**
 * Creates a new review for a book (starts as Pending)
 * @param {Object} reviewData - Review text, rating, bookId, and userId
 */
const createReview = async (reviewData) => {
    return await Review.create(reviewData);
};

/**
 * Fetches all reviews that are currently Pending (for Admin)
 */
const getPendingReviews = async () => {
    return await Review.find({ status: 'Pending' })
        .populate('book', 'title coverImage')
        .populate('user', 'name photo')
        .lean();
};

/**
 * Approves a pending review
 * @param {string} id - Review ID
 */
const approveReview = async (id) => {
    const review = await Review.findByIdAndUpdate(
        id,
        { status: 'Approved' },
        { new: true, runValidators: true }
    );
    if (!review) throw new Error('Review not found');

    // Track Activity: User rates a book (only after review is approved)
    await socialService.createActivity(review.user, 'RATED_BOOK', review.book, { rating: review.rating, review: review.review }, review._id);

    return review;
};

/**
 * Deletes a review record
 * @param {string} id - Review ID
 */
const deleteReview = async (id) => {
    const review = await Review.findByIdAndDelete(id);
    if (!review) throw new Error('Review not found');
    return review;
};

/**
 * Fetches all approved reviews for a specific book
 * @param {string} bookId - Book ID
 */
const getBookReviews = async (bookId) => {
    return await Review.find({ book: bookId, status: 'Approved' })
        .sort('-createdAt')
        .populate('user', 'name photo')
        .populate('comments.user', 'name photo');
};

const toggleLike = async (reviewId, userId) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error('Review not found');

    const isLiked = review.likes.includes(userId);
    if (isLiked) {
        review.likes = review.likes.filter(id => id.toString() !== userId.toString());
    } else {
        review.likes.push(userId);
    }
    await review.save();
    return review;
};

const addComment = async (reviewId, userId, text) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error('Review not found');

    review.comments.push({ user: userId, text });
    await review.save();

    return await review.populate('comments.user', 'name photo');
};

module.exports = {
    createReview,
    getPendingReviews,
    approveReview,
    deleteReview,
    getBookReviews,
    toggleLike,
    addComment
};
