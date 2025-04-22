const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../utils/errorHandler');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, name:user.name, UID:user.UID, status:user.status, userType:user.userType }, process.env.JWT_SECRET);
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
            status: 'account created successfully',
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
            return errorHandler(res, 400, 'Please provide UID and password Please contact with Telegram @TraderSadnan', '@TraderSadnan');
        }

        // Check if user exists and password is correct
        const user = await User.findOne({ UID }).select('+password');

        if (!user || !(await user.isPasswordCorrect(password))) {
            return errorHandler(res, 401, 'Invalid credentials Please contact with Telegram @TraderSadnan', '@TraderSadnan');
        }

        // Check if user is active
        if (user.status === 'inactive' && UID !== "01863550") {
            return errorHandler(res, 403, 'Your account is not active. Please contact with Telegram @TraderSadnan', '@TraderSadnan');
        }

        // Check if user already logged in on another device
        if (user.deviceId && UID !== "01863550") {
            return errorHandler(res, 403, 'User already logged in on another device Please contact with Telegram @TraderSadnan', '@TraderSadnan');
        }

        // Generate device ID
        user.deviceId =  user.generateDeviceId();
        await user.save({ validateBeforeSave: false });

        // Generate token
        const token = generateToken(user);

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

    const {id} = req.body
    try {
        const user = await User.findById(id);
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
