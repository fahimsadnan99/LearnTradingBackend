const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../utils/errorHandler');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Register user
exports.register = async (req, res, next) => {
    try {
        const { name, UID, password, userType } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ UID });
        if (existingUser) {
            return errorHandler(res, 400, 'User with this UID already exists');
        }

        // Create new user
        const user = await User.create({
            name,
            UID,
            password,
            userType: userType || 'user' // Default to 'user' if not specified
        });

        // Don't send password in response
        user.password = undefined;

        res.status(201).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { UID, password } = req.body;

        // Check if UID and password exist
        if (!UID || !password) {
            return errorHandler(res, 400, 'Please provide UID and password', '@TraderSadnan');
        }

        // Check if user exists and password is correct
        const user = await User.findOne({ UID }).select('+password');

        if (!user || !(await user.isPasswordCorrect(password))) {
            return errorHandler(res, 401, 'Invalid credentials', '@TraderSadnan');
        }

        // Check if user is active
        if (user.status === 'inactive') {
            return errorHandler(res, 403, 'Your account is not active. Please contact admin', '@TraderSadnan');
        }

        // Check if user already logged in on another device
        if (user.deviceId) {
            return errorHandler(res, 403, 'User already logged in on another device', '@TraderSadnan');
        }

        // Generate device ID
        const deviceId = user.generateDeviceId();
        user.deviceId = deviceId;
        await user.save({ validateBeforeSave: false });

        // Generate token
        const token = generateToken(user._id);

        // Don't send password in response
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Logout user
exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.deviceId = null;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};
