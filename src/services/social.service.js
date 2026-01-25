const Follow = require('../models/Follow');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Review = require('../models/Review');

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
const createActivity = async (userId, type, bookId, data = {}, reviewId = null) => {
    try {
        await Activity.create({
            user: userId,
            type,
            book: bookId,
            data,
            review: reviewId
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
    // 1. Get followings - lean() and select()
    const followings = await Follow.find({ follower: userId }).select('following').lean();
    const followingIds = followings.map(f => f.following);

    if (followingIds.length === 0) return [];

    // 2. Fetch activities with projection and lean
    const activities = await Activity.find({ user: { $in: followingIds } })
        .sort('-createdAt')
        .limit(30)
        .populate('user', 'name photo')
        .populate('book', 'title coverImage')
        .populate('review')
        .populate('comments.user', 'name photo')
        .populate({
            path: 'review',
            populate: { path: 'comments.user', select: 'name photo' }
        });


    return activities
        .filter(act => act.book && act.user)
        .map(act => {
            let shelf = undefined;
            if (act.type === 'ADD_TO_READ') shelf = 'Read';
            if (act.type === 'FINISHED_BOOK') shelf = 'Read';

            // Use Review data if available for interaction counts/lists
            const likes = (act.review && act.type === 'RATED_BOOK') ? act.review.likes : (act.likes || []);
            const comments = (act.review && act.type === 'RATED_BOOK') ? act.review.comments : (act.comments || []);

            return {
                id: act._id,
                user: act.user,
                book: act.book,
                type: act.type === 'RATED_BOOK' ? 'review' : 'shelf_update',
                shelf: shelf,
                rating: act.data?.rating,
                review: act.data?.review,
                timestamp: act.createdAt,
                likes: likes,
                comments: comments
            };
        });
};

/**
 * Fetch a specific user's activity log for their profile
 */
const getUserActivity = async (targetUserId) => {
    const activities = await Activity.find({ user: targetUserId })
        .sort('-createdAt')
        .limit(10)
        .populate('user', 'name photo')
        .populate('book', 'title coverImage')
        .populate({
            path: 'review',
            populate: { path: 'comments.user', select: 'name photo' }
        })
        .populate('comments.user', 'name photo');


    return activities
        .filter(act => act.book) // Only show if book exists
        .map(act => {
            let shelf = undefined;
            if (act.type === 'ADD_TO_READ') shelf = 'Read';
            if (act.type === 'FINISHED_BOOK') shelf = 'Read';

            // Use Review data if available
            const likes = (act.review && act.type === 'RATED_BOOK') ? act.review.likes : (act.likes || []);
            const comments = (act.review && act.type === 'RATED_BOOK') ? act.review.comments : (act.comments || []);

            return {
                id: act._id,
                user: act.user,
                book: act.book,
                type: act.type === 'RATED_BOOK' ? 'review' : 'shelf_update',
                shelf: shelf,
                rating: act.data?.rating,
                review: act.data?.review,
                timestamp: act.createdAt,
                likes: likes,
                comments: comments
            };
        });
};

const getSuggestedUsers = async (userId) => {
    const followings = await Follow.find({ follower: userId }).select('following').lean();
    const followingIds = followings.map(f => f.following);
    followingIds.push(userId);

    return await User.find({ _id: { $nin: followingIds }, role: 'User' })
        .select('name photo role')
        .lean();
};

const getFollowing = async (userId) => {
    const followings = await Follow.find({ follower: userId })
        .populate('following', 'name photo role')
        .lean();

    return followings.map(f => f.following);
};

/**
 * Searches for users by name or email
 */
const searchUsers = async (query, currentUserId) => {
    return await User.find({
        $and: [
            { _id: { $ne: currentUserId } },
            {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }
        ]
    }).select('name photo bio email').limit(10);
};

const toggleLike = async (activityId, userId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) throw new Error('Activity not found');

    // If linked to a review, apply like to the review instead
    if (activity.review && activity.type === 'RATED_BOOK') {
        const review = await Review.findById(activity.review);
        if (review) {
            const isLiked = review.likes.includes(userId);
            if (isLiked) {
                review.likes = review.likes.filter(id => id.toString() !== userId.toString());
            } else {
                review.likes.push(userId);
            }
            await review.save();
            return { ...activity.toObject(), likes: review.likes };
        }
    }

    const isLiked = activity.likes.includes(userId);
    if (isLiked) {
        activity.likes = activity.likes.filter(id => id.toString() !== userId.toString());
    } else {
        activity.likes.push(userId);
    }
    await activity.save();
    return activity;
};

const addComment = async (activityId, userId, text) => {
    const activity = await Activity.findById(activityId);
    if (!activity) throw new Error('Activity not found');

    // If linked to a review, apply comment to the review instead
    if (activity.review && activity.type === 'RATED_BOOK') {
        const review = await Review.findById(activity.review);
        if (review) {
            review.comments.push({ user: userId, text });
            await review.save();
            const populatedReview = await review.populate('comments.user', 'name photo');
            return { ...activity.toObject(), comments: populatedReview.comments };
        }
    }

    activity.comments.push({ user: userId, text });
    await activity.save();

    // Return populated activity to show new comment immediately
    return await activity.populate('comments.user', 'name photo');
};

module.exports = {
    followUser,
    unfollowUser,
    createActivity,
    getActivityFeed,
    getUserActivity,
    getSuggestedUsers,
    getFollowing,
    searchUsers,
    toggleLike,
    addComment
};
