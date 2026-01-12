const { z } = require('zod');

/**
 * Zod Validation Schemas for Library & Reading Tracker
 */

const addToLibrarySchema = z.object({
    body: z.object({
        bookId: z.string({ required_error: "Book ID is required" }),
        shelf: z.enum(['Want to Read', 'Currently Reading', 'Read'], {
            required_error: "Shelf must be 'Want to Read', 'Currently Reading', or 'Read'"
        }),
    }),
});

const updateProgressSchema = z.object({
    body: z.object({
        pagesRead: z.number({ required_error: "Pages read must be a number" }).min(0),
    }),
});

module.exports = {
    addToLibrarySchema,
    updateProgressSchema,
};
