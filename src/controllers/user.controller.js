const userService = require('../services/user.service');

/**
 * Controller to handle Admin-specific User operations
 */

/**
 * Fetches all users for the admin list
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
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
 * Updates user role (e.g., promoting a User to Admin)
 */
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await userService.updateUserRole(req.params.id, role);
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Removes a user from the system
 */
const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
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

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser
};
