const { z } = require('zod');

/**
 * Zod Validation Schemas for Review Operations
 */

const createReviewSchema = z.object({
    body: z.object({
        review: z.string({ required_error: "Review text is required" }).min(5, "Review must be at least 5 characters"),
        rating: z.number({ required_error: "Rating is required" }).min(1).max(5),
        bookId: z.string({ required_error: "Book ID is required" }),
    }),
});

module.exports = {
    createReviewSchema,
};
