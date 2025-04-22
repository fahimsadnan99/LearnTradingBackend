// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authMiddleware.protect,
    authMiddleware.UserTypeCheck('admin'),  authController.logout);

// User management routes (admin only)
router.get(
    '/users',
    authMiddleware.protect,
    authMiddleware.UserTypeCheck('admin'),
    userController.getAllUsers
);

// Fixed route - ensure the parameter is properly formatted
router.delete(
    '/user/:id/delete',
    authMiddleware.protect,
    authMiddleware.UserTypeCheck('admin'),
    userController.deleteUser
);

// Fixed route - ensure the parameter is properly formatted
router.patch(
    '/users/:id/status',
    authMiddleware.protect,
    authMiddleware.UserTypeCheck('admin'),
    userController.updateUserStatus
);

router.patch(
    '/users/:id/status',
    authMiddleware.protect,
    authMiddleware.UserTypeCheck('admin'),
    userController.updateUserStatus
);


module.exports = router;

//here change