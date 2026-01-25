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

/**
 * Updates the current logged-in user's profile
 */
const updateMe = async (req, res) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            return res.status(400).json({
                status: 'fail',
                message: 'This route is not for password updates. Please use /updateMyPassword.'
            });
        }

        // 2) Filtered out unwanted fields names that are not allowed to be updated
        // Allowed: name, phone, location
        // Images handled via req.files
        const filteredBody = {};
        const allowedFields = ['name', 'phone', 'location'];

        Object.keys(req.body).forEach(el => {
            if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
        });

        // 3) Handle Files (Cloudinary)
        if (req.files) {
            if (req.files.photo) {
                filteredBody.photo = req.files.photo[0].path;
            }
            if (req.files.coverPhoto) {
                filteredBody.coverPhoto = req.files.coverPhoto[0].path;
            }
        }

        // 4) Update User
        const updatedUser = await userService.updateUserProfile(req.user.id, filteredBody);

        res.status(200).json({
            status: 'success',
            data: updatedUser
        });

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Get public profile logic
 */
const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: user
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
    deleteUser,
    updateMe,
    getUserById
};
