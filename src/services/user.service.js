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

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser
};
