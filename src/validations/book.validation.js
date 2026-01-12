const { z } = require('zod');

/**
 * Zod Validation Schemas for Book Operations
 */

const createBookSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        author: z.string({ required_error: "Author is required" }),
        genre: z.string({ required_error: "Genre ID is required" }),
        description: z.string({ required_error: "Description is required" }),
        totalPages: z.string().optional().transform(v => v ? parseInt(v) : 0),
    }),
});

const updateBookSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        author: z.string().optional(),
        genre: z.string().optional(),
        description: z.string().optional(),
        totalPages: z.string().optional().transform(v => v ? parseInt(v) : undefined),
    }),
});

module.exports = {
    createBookSchema,
    updateBookSchema,
};
