const { z } = require('zod');

const createGenreSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Genre name is required",
        }).min(2, "Genre name must be at least 2 characters")
            .max(40, "Genre name cannot exceed 40 characters"),
    }),
});

const updateGenreSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(40).optional(),
    }),
});

module.exports = {
    createGenreSchema,
    updateGenreSchema,
};
