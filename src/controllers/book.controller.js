const bookService = require('../services/book.service');

/**
 * Controller to handle Book related HTTP requests/responses
 */

/**
 * Handles creation of a new book, including file path processing
 */
const createBook = async (req, res) => {
    try {
        if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
            return res.status(400).json({
                status: 'fail',
                message: 'Both cover image and PDF file are required'
            });
        }

        const bookData = {
            ...req.body,
            coverImage: req.files.coverImage[0].path,
            pdfUrl: req.files.pdfFile[0].path
        };

        const book = await bookService.createBook(bookData);
        res.status(201).json({
            status: 'success',
            data: book
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles fetching of books with search, filter (multi-genre), and pagination
 */
const getAllBooks = async (req, res) => {
    try {
        const { genre, search, page, limit, sort, rating } = req.query;
        const filter = {};

        // Multi-genre filtering support
        if (genre) {
            const genres = genre.split(',');
            filter.genre = { $in: genres };
        }

        if (rating) {
            filter.averageRating = { $gte: parseFloat(rating) };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }

        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy: sort || '-createdAt'
        };

        const result = await bookService.getAllBooks(filter, options);
        res.status(200).json({
            status: 'success',
            ...result
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches a single book by ID
 */
const getBookById = async (req, res) => {
    try {
        const book = await bookService.getBookById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: book
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles book updates, including optional new file uploads
 */
const updateBook = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.files) {
            if (req.files.coverImage) updateData.coverImage = req.files.coverImage[0].path;
            if (req.files.pdfFile) updateData.pdfUrl = req.files.pdfFile[0].path;
        }

        const book = await bookService.updateBook(req.params.id, updateData);
        res.status(200).json({
            status: 'success',
            data: book
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles book deletion
 */
const deleteBook = async (req, res) => {
    try {
        await bookService.deleteBook(req.params.id);
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

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
};
