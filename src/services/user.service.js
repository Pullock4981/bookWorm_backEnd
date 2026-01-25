const User = require('../models/User');

/**
 * Service to handle User management logic for Admin
 */

/**
 * Fetches all users from the database
 */
const getAllUsers = async () => {
    return await User.find().sort('-createdAt');
};

/**
 * Updates a user's role (Admin/User)
 * @param {string} userId - ID of the user to update
 * @param {string} role - New role to assign
 */
const updateUserRole = async (userId, role) => {
    if (!['User', 'Admin'].includes(role)) {
        throw new Error('Invalid role');
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
    );

    if (!user) throw new Error('User not found');
    return user;
};

/**
 * Deletes a user from the system
 * @param {string} userId - ID of the user to delete
 */
const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('User not found');
    return user;
};

/**
 * Updates a user's profile (Authenticated User)
 * @param {string} userId - ID of the user
 * @param {object} updateData - Data to update (name, phone, location, images)
 */
const updateUserProfile = async (userId, updateData) => {
    // Filter out restricted fields just in case controller didn't catch them, though controller should handle 'role', 'password' exclusion.
    // For simplicity, we trust the controller passed valid data.

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    });

    if (!user) throw new Error('User not found');
    return user;
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateUserProfile
};
