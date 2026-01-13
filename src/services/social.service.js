const Follow = require('../models/Follow');
const Activity = require('../models/Activity');
const User = require('../models/User');

/**
 * Business Rule: A user can follow another user
 * Prevent duplicate follow records via unique index in Schema
 */
const followUser = async (followerId, followingId) => {
    if (followerId.toString() === followingId.toString()) {
        throw new Error('You cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (existingFollow) {
        throw new Error('Already following this user');
    }

    // Check if followingId exists
    const followingUser = await User.findById(followingId);
    if (!followingUser) throw new Error('User not found');

    const follow = await Follow.create({
        follower: followerId,
        following: followingId
    });

    return follow;
};

/**
 * Business Rule: A user can unfollow another user
 */
const unfollowUser = async (followerId, followingId) => {
    const result = await Follow.findOneAndDelete({
        follower: followerId,
        following: followingId
    });

    if (!result) throw new Error('You are not following this user');
    return result;
};

/**
 * Internal helper to track meaningful user activities
 */
const createActivity = async (userId, type, bookId, data = {}) => {
    try {
        await Activity.create({
            user: userId,
            type,
            book: bookId,
            data
        });
    } catch (err) {
        console.error('Activity creation failed:', err.message);
        // Silently fail as this shouldn't block the main process
    }
};

/**
 * Activity Feed Logic:
 * - Fetch followings -> Fetch activities -> Limit to 20-30 -> Skip if book deleted
 */
const getActivityFeed = async (userId) => {
    // 1. Get the list of users the logged-in user is following
    const followings = await Follow.find({ follower: userId }).select('following');
    const followingIds = followings.map(f => f.following);

    if (followingIds.length === 0) return [];

    // 2. Fetch recent activities from those users only
    const activities = await Activity.find({ user: { $in: followingIds } })
        .sort('-createdAt')
        .limit(30)
        .populate('user', 'name photo')
        .populate('book', 'title coverImage');

    // 3. Skip activities if the related book no longer exists (filtered by populate)
    // 4. Return formatted feed
    return activities
        .filter(act => act.book && act.user) // Filter out deleted books or users
        .map(act => {
            // Determine shelf for display
            let shelf = undefined;
            if (act.type === 'ADD_TO_READ') shelf = 'Read';
            if (act.type === 'FINISHED_BOOK') shelf = 'Read';

            return {
                id: act._id,
                user: act.user,
                book: act.book,
                type: act.type === 'RATED_BOOK' ? 'review' : 'shelf_update', // Map to frontend types
                shelf: shelf,
                rating: act.data?.rating,
                timestamp: act.createdAt
            };
        });
};

/**
 * Suggests users to follow
 * Logic: Find users who are NOT followed by current user
 */
const getSuggestedUsers = async (userId) => {
    // 1. Get list of users already followed
    const followings = await Follow.find({ follower: userId }).select('following');
    const followingIds = followings.map(f => f.following);

    // 2. Add current user to exclusion list
    followingIds.push(userId);

    // 3. Find users NOT in this list
    const suggestions = await User.find({ _id: { $nin: followingIds }, role: 'User' })
        .limit(5)
        .select('name photo role'); // Only needed fields

    return suggestions;
};

/**
 * Fetches list of users the current user is following
 */
const getFollowing = async (userId) => {
    const followings = await Follow.find({ follower: userId })
        .populate('following', 'name photo role');

    return followings.map(f => f.following);
};

module.exports = {
    followUser,
    unfollowUser,
    createActivity,
    getActivityFeed,
    getSuggestedUsers,
    getFollowing
};
