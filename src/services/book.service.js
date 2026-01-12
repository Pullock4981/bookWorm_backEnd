const Book = require('../models/Book');

/**
 * Service to handle core Book business logic
 */

/**
 * Creates a new book record in the database
 * @param {Object} bookData - Data containing title, author, genre, etc.
 */
const createBook = async (bookData) => {
    return await Book.create(bookData);
};

/**
 * Fetches all books with optional filters, pagination, and sorting
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - Pagination (page, limit) and sorting options
 */
const getAllBooks = async (filter = {}, options = {}) => {
    const { sortBy = '-createdAt', limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;

    const books = await Book.find(filter)
        .sort(sortBy)
        .limit(limit)
        .skip(skip);

    const total = await Book.countDocuments(filter);

    return {
        books,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * Retrieves a single book by its unique ID
 * @param {string} id - Book ID
 */
const getBookById = async (id) => {
    const book = await Book.findById(id);
    if (!book) throw new Error('Book not found');
    return book;
};

/**
 * Updates an existing book record
 * @param {string} id - Book ID
 * @param {Object} updateData - Fields to update
 */
const updateBook = async (id, updateData) => {
    const book = await Book.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
    if (!book) throw new Error('Book not found');
    return book;
};

/**
 * Deletes a book record from the database
 * @param {string} id - Book ID
 */
const deleteBook = async (id) => {
    const book = await Book.findByIdAndDelete(id);
    if (!book) throw new Error('Book not found');
    return book;
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
};
