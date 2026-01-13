const User = require('../models/User');
const Library = require('../models/Library');
const Review = require('../models/Review');

/**
 * Service to handle Social interactions and Activity feed
 */

/**
 * Logic to follow another user
 * @param {string} followerId - ID of the user who is following
 * @param {string} followedId - ID of the user being followed
 */
const followUser = async (followerId, followedId) => {
    if (followerId.toString() === followedId.toString()) {
        throw new Error('You cannot follow yourself');
    }

    const user = await User.findById(followerId);
    if (user.following.includes(followedId)) {
        throw new Error('Already following this user');
    }

    user.following.push(followedId);
    await user.save();
    return user;
};

/**
 * Logic to unfollow a user
 */
const unfollowUser = async (followerId, followedId) => {
    const user = await User.findById(followerId);
    user.following = user.following.filter(id => id.toString() !== followedId.toString());
    await user.save();
    return user;
};

/**
 * Generates an activity feed based on users being followed
 * @param {string} userId - Current user ID
 */
const getActivityFeed = async (userId) => {
    const user = await User.findById(userId);
    const followingIds = user.following;

    // If following no one, show global feed
    const query = followingIds.length > 0 ? { user: { $in: followingIds } } : {};

    // 1. Fetch recent library updates
    const libraryActivities = await Library.find(query)
        .sort('-updatedAt')
        .limit(10)
        .populate('user', 'name photo')
        .populate('book', 'title coverImage');

    // 2. Fetch recent approved reviews
    const reviewQuery = followingIds.length > 0
        ? { user: { $in: followingIds }, status: 'Approved' }
        : { status: 'Approved' };

    const reviewActivities = await Review.find(reviewQuery)
        .sort('-createdAt')
        .limit(10)
        .populate('user', 'name photo')
        .populate('book', 'title coverImage');

    // 3. Combine and Format activities
    const activities = [
        ...libraryActivities.map(item => ({
            type: 'library',
            user: item.user,
            book: item.book,
            shelf: item.shelf,
            timestamp: item.updatedAt,
            message: `${item.user.name} added "${item.book.title}" to ${item.shelf} shelf`
        })),
        ...reviewActivities.map(item => ({
            type: 'review',
            user: item.user,
            book: item.book,
            rating: item.rating,
            timestamp: item.createdAt,
            message: `${item.user.name} rated "${item.book.title}" ${item.rating} stars`
        }))
    ];

    // Sort combined feed by latest timestamp
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
};

module.exports = {
    followUser,
    unfollowUser,
    getActivityFeed
};
