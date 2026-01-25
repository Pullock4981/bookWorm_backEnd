const socialService = require('../services/social.service');

/**
 * Controller to handle Social interaction requests
 */

/**
 * Handles follow request
 */
const followUser = async (req, res) => {
    try {
        const user = await socialService.followUser(req.user._id, req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'User followed successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles unfollow request
 */
const unfollowUser = async (req, res) => {
    try {
        const user = await socialService.unfollowUser(req.user._id, req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'User unfollowed successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches the social activity feed for the current user
 */
const getFeed = async (req, res) => {
    try {
        const feed = await socialService.getActivityFeed(req.user._id);
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

const toggleLike = async (req, res) => {
    try {
        const activity = await socialService.toggleLike(req.params.id, req.user._id);
        res.status(200).json({
            status: 'success',
            data: {
                likes: activity.likes
            }
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        if (!req.body.text) throw new Error('Comment text required');
        const activity = await socialService.addComment(req.params.id, req.user._id, req.body.text);
        res.status(200).json({
            status: 'success',
            data: {
                comments: activity.comments
            }
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

/**
 * Fetches the social activity feed for a specific user (profile view)
 */
const getUserActivity = async (req, res) => {
    try {
        const activities = await socialService.getUserActivity(req.params.userId || req.user._id);
        res.status(200).json({
            status: 'success',
            results: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches users to follow
 */
const getSuggestedUsers = async (req, res) => {
    try {
        const users = await socialService.getSuggestedUsers(req.user._id);
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches list of users followed by current user
 */
const getFollowing = async (req, res) => {
    try {
        const following = await socialService.getFollowing(req.user._id);
        res.status(200).json({
            status: 'success',
            results: following.length,
            data: following
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles user search request
 */
const searchUsers = async (req, res) => {
    try {
        const users = await socialService.searchUsers(req.query.q, req.user._id);
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {

    followUser,
    unfollowUser,
    getFeed,
    getUserActivity,
    getSuggestedUsers,
    getFollowing,
    searchUsers,
    toggleLike,
    addComment
};
