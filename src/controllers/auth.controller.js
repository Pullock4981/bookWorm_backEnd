const authService = require('../services/auth.service');

const sendTokenResponse = (result, statusCode, res) => {
    const { token, ...userData } = result;

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    };

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        status: 'success',
        data: userData
    });
};

const register = async (req, res, next) => {
    try {
        const userData = { ...req.body };
        if (req.file) userData.photo = req.file.path;

        const result = await authService.register(userData);
        sendTokenResponse(result, 201, res);
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        sendTokenResponse(result, 200, res);
    } catch (error) {
        res.status(401).json({ status: 'fail', message: error.message });
    }
};

const getMe = async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: req.user
    });
};

const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success', data: {} });
};

module.exports = {
    register,
    login,
    getMe,
    logout
};
