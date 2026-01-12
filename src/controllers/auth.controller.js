const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const userData = { ...req.body };
        console.log('--- Registering User ---', userData.email);

        if (req.file) {
            userData.photo = req.file.path;
            console.log('Photo uploaded to Cloudinary');
        }

        const result = await authService.register(userData);
        console.log('User created successfully in DB');

        res.status(201).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('REGISTRATION FAILED:', error.message);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getMe = async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: req.user
    });
};

module.exports = {
    register,
    login,
    getMe,
};
