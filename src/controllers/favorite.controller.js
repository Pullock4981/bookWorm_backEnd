const Favorite = require('../models/Favorite');


/**
 * Toggle Favorite: Add if not exists, Remove if exists
 */
const toggleFavorite = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user._id;

        const existing = await Favorite.findOne({ user: userId, book: bookId });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.status(200).json({
                status: 'success',
                data: null,
                message: 'Removed from favorites',
                isFavorited: false
            });
        } else {
            const newFavorite = await Favorite.create({ user: userId, book: bookId });
            return res.status(201).json({
                status: 'success',
                data: newFavorite,
                message: 'Added to favorites',
                isFavorited: true
            });
        }
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Check if a specific book is favorited by the user
 */
const checkFavoriteStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user._id;

        const existing = await Favorite.findOne({ user: userId, book: bookId }).select('_id').lean();

        res.status(200).json({
            status: 'success',
            isFavorited: !!existing
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Get all favorites for the logged-in user
 */
const getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
            .populate('book', 'title author coverImage')
            .sort('-createdAt')
            .lean();

        res.status(200).json({
            status: 'success',
            results: favorites.length,
            data: favorites
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    toggleFavorite,
    checkFavoriteStatus,
    getMyFavorites
};
