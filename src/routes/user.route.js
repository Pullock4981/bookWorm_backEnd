const express = require('express');
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

/**
 * Protect all routes below: Only Admins can access user management
 */
router.use(protect, restrictTo('Admin'));

router.get('/', userController.getAllUsers);
router.patch('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;
