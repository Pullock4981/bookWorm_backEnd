const express = require('express');
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.patch('/me',
    protect,
    upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]),
    userController.updateMe
);

/**
 * Protect all routes below: Only Admins can access user management
 */
// router.use(protect, restrictTo('Admin')); // We can't use this globally anymore due to /me being here

router.get('/', protect, restrictTo('Admin'), userController.getAllUsers);
router.patch('/:id/role', protect, restrictTo('Admin'), userController.updateUserRole);
router.delete('/:id', protect, restrictTo('Admin'), userController.deleteUser);

module.exports = router;
