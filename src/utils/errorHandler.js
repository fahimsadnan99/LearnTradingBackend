// src/utils/errorHandler.js
exports.errorHandler = (res, statusCode, message, contact = null) => {
    return res.status(statusCode).json({
        status: 'error',
        message,
        contact
    });
};

exports.globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
            status: 'error',
            message: `Invalid input data: ${errors.join('. ')}`
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: 'error',
            message: `Duplicate field value: ${field}. Please use another value`
        });
    }

    // Default error response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
