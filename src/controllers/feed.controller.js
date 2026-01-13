const Review = require('../models/Review');

/**
 * Get global activity feed (recent reviews from all users)
 */
const getGlobalFeed = async (req, res) => {
    try {
        const feed = await Review.find({ status: 'Approved' })
            .sort('-createdAt')
            .limit(10)
            .populate('user', 'name photo')
            .populate('book', 'title coverImage author');

        res.status(200).json({
            status: 'success',
            results: feed.length,
            data: feed
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    getGlobalFeed
};
