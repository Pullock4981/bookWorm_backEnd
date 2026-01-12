const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const register = async (userData) => {
    const { name, email, password, photo } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        photo
    });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const login = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password, user.password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

module.exports = {
    register,
    login,
};
