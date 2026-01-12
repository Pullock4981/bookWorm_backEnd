const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes: Verifies JWT token from headers or cookies
 * and attaches the current user to the request object.
 */
const protect = async (req, res, next) => {

    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token or token expired'
        });
    }
};

// Role-based access control
/**
 * Middleware to restrict access based on user roles (e.g., 'Admin')
 * @param  {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {

    return (req, res, next) => {
        // Convert user role and allowed roles to lowercase for comparison
        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo,
};
