const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const { upload } = require('../config/cloudinary');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', upload.single('photo'), validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);
router.get('/logout', authController.logout);

module.exports = router;
