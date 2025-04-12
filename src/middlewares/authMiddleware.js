// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { errorHandler } = require('../utils/errorHandler');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return errorHandler(res, 401, 'You are not logged in. Please log in to get access');
        }

        // Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return errorHandler(res, 401, 'The user belonging to this token no longer exists');
        }

        // Check if user is still active
        if (user.status === 'inactive') {
            return errorHandler(res, 403, 'Your account has been deactivated. Please contact admin');
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return errorHandler(res, 401, 'Invalid token. Please log in again');
        }
        if (error.name === 'TokenExpiredError') {
            return errorHandler(res, 401, 'Your token has expired. Please log in again');
        }
        next(error);
    }
};

exports.UserTypeCheck = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return errorHandler(res, 403, 'You do not have permission to perform this action');
        }
        next();
    };
};