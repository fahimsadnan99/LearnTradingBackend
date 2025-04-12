const User = require('../models/User');
const { errorHandler } = require('../utils/errorHandler');

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
    try {
        let query = { _id: { $ne: req.user._id } };

        // Apply search filters
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }

        if (req.query.UID) {
            query.UID = { $regex: req.query.UID, $options: 'i' };
        }

        // Filter by status
        if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort('name');

        const total = await User.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: users.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: {
                users
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return errorHandler(res, 404, 'No user found with that ID');
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return errorHandler(res, 400, 'Please provide a valid status (active/inactive)');
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return errorHandler(res, 404, 'No user found with that ID');
        }

        // If changing to inactive and user is logged in, force logout
        if (status === 'inactive' && user.deviceId) {
            user.deviceId = null;
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

