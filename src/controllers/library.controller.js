const libraryService = require('../services/library.service');

/**
 * Controller to handle Library related HTTP requests/responses
 */

/**
 * Handles adding a book to a user's shelf
 */
const addToLibrary = async (req, res) => {
    try {
        const { bookId, shelf } = req.body;
        const entry = await libraryService.addToLibrary(req.user._id, bookId, shelf);
        res.status(200).json({
            status: 'success',
            data: entry
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches the logged-in user's personal library
 */
const getMyLibrary = async (req, res) => {
    try {
        const entries = await libraryService.getMyLibrary(req.user._id);
        res.status(200).json({
            status: 'success',
            results: entries.length,
            data: entries
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles progress tracking for a book
 */
const updateProgress = async (req, res) => {
    try {
        const { id } = req.params; // bookId
        const { pagesRead, totalPages } = req.body;
        const entry = await libraryService.updateProgress(req.user._id, id, pagesRead, totalPages);
        res.status(200).json({
            status: 'success',
            data: entry
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles removal from library
 */
const removeFromLibrary = async (req, res) => {
    try {
        await libraryService.removeFromLibrary(req.user._id, req.params.id);
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
 * Checks if a specific book is in user's library
 */
const checkBookStatus = async (req, res) => {
    try {
        const entry = await libraryService.checkBookStatus(req.user._id, req.params.bookId);
        res.status(200).json({
            status: 'success',
            data: {
                isInLibrary: !!entry,
                shelf: entry ? entry.shelf : null,
                entry: entry || null
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    addToLibrary,
    getMyLibrary,
    updateProgress,
    removeFromLibrary,
    checkBookStatus
};
