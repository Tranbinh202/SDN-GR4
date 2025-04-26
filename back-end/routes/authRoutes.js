const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { updateProfile } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// Route đăng nhập
router.post('/login', login);

// Route cập nhật profile user
router.put('/profile', authMiddleware, updateProfile);

module.exports = router; 