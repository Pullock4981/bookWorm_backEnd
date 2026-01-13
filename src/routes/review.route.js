const express = require('express');
const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate');
const { createReviewSchema } = require('../validations/review.validation');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

/**
 * Public User Routes: Submit reviews (Requires login)
 */
router.post('/', protect, validate(createReviewSchema), reviewController.createReview);
router.get('/book/:bookId', reviewController.getBookReviews);

/**
 * Admin Only Routes: Moderation
 */
router.use(protect, restrictTo('Admin'));

router.get('/pending', reviewController.getPendingReviews);
router.patch('/:id/approve', reviewController.approveReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
