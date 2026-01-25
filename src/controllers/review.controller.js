const reviewService = require('../services/review.service');

/**
 * Controller to handle Book Review related HTTP requests/responses
 */

/**
 * Handles user review submission
 */
const createReview = async (req, res) => {
    try {
        const { review, rating, bookId } = req.body;
        const result = await reviewService.createReview({
            review,
            rating,
            book: bookId,
            user: req.user._id
        });
        res.status(201).json({
            status: 'success',
            message: 'Review submitted successfully and is awaiting moderation.',
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches all pending reviews for Admin moderation
 */
const getPendingReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getPendingReviews();
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Admin action to approve a review
 */
const approveReview = async (req, res) => {
    try {
        const review = await reviewService.approveReview(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Review approved successfully.',
            data: review
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Admin action to delete a review
 */
const deleteReview = async (req, res) => {
    try {
        await reviewService.deleteReview(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches all approved reviews for a specific book
 */
const getBookReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getBookReviews(req.params.bookId);
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const review = await reviewService.toggleLike(req.params.id, req.user._id);
        res.status(200).json({
            status: 'success',
            data: review
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) throw new Error('Comment text is required');

        const review = await reviewService.addComment(req.params.id, req.user._id, text);
        res.status(200).json({
            status: 'success',
            data: review
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
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
