const Library = require('../models/Library');
const Book = require('../models/Book');
const socialService = require('./social.service');

/**
 * Service to handle Library & Reading Tracker business logic
 */

/**
 * Adds a book to a user's shelf or updates its position
 */
const addToLibrary = async (userId, bookId, shelf) => {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');

    // Update or Create library entry
    const libraryEntry = await Library.findOneAndUpdate(
        { user: userId, book: bookId },
        {
            shelf,
            totalPages: book.totalPages || 0,
            // If moved to 'Read', mark progress as complete
            ...(shelf === 'Read' && { pagesRead: book.totalPages || 0 })
        },
        { upsert: true, new: true, runValidators: true }
    );

    // Track Activity: User adds a book to the "Read" shelf
    if (shelf === 'Read') {
        await socialService.createActivity(userId, 'ADD_TO_READ', bookId);
    }

    return libraryEntry;
};

/**
 * Fetches all books in a user's library
 */
const getMyLibrary = async (userId) => {
    return await Library.find({ user: userId }).sort('-updatedAt');
};

/**
 * Updates reading progress for a specific book
 */
const updateProgress = async (userId, bookId, pagesRead, totalPages) => {
    const entry = await Library.findOne({ user: userId, book: bookId });
    if (!entry) throw new Error('Book not found in your library');

    // Update totalPages if provided (fixes issue where DB has 0 pages)
    if (totalPages && totalPages > 0) {
        entry.totalPages = totalPages;
    }

    if (pagesRead > entry.totalPages && entry.totalPages > 0) {
        // Allow equal, but log/warn if greater? Just cap it for safety
        // pagesRead = entry.totalPages; 
        // User might have a different edition, but let's stick to the logic
    }

    const wasFinished = entry.pagesRead === entry.totalPages && entry.totalPages > 0;
    entry.pagesRead = pagesRead;

    // Auto-move to "Read" if pagesRead matches totalPages
    if (entry.totalPages > 0 && pagesRead >= entry.totalPages) {
        entry.shelf = 'Read';
        entry.pagesRead = entry.totalPages; // Ensure it matches

        // Track Activity: User finishes reading a book
        if (!wasFinished) {
            await socialService.createActivity(userId, 'FINISHED_BOOK', bookId);
        }
    } else if (pagesRead > 0 && entry.shelf === 'Want to Read') {
        // Auto-move to "Currently Reading" if user starts reading
        entry.shelf = 'Currently Reading';
    } else if (pagesRead < entry.totalPages && entry.shelf === 'Read') {
        // If user moves back, maybe move to Currently Reading? 
        // Let's keep it 'Read' unless explicitly changed, or maybe move back to 'Currently Reading'
        entry.shelf = 'Currently Reading';
    }

    await entry.save();
    return entry;
};

/**
 * Removes a book from the user's library
 */
const removeFromLibrary = async (userId, bookId) => {
    const result = await Library.findOneAndDelete({ user: userId, book: bookId });
    if (!result) throw new Error('Book not found in library');
    return result;
};

module.exports = {
    addToLibrary,
    getMyLibrary,
    updateProgress,
    removeFromLibrary
};
