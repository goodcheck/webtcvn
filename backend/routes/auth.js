const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, company } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            company
        });

        // Generate token
        const token = user.generateToken();

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // Check for user (include password)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Generate token
        const token = user.generateToken();

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                company: req.user.company,
                taxCode: req.user.taxCode,
                address: req.user.address,
                phone: req.user.phone,
                representativeRole: req.user.representativeRole,
                logo: req.user.logo,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', require('../middleware/auth').protect, async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            company: req.body.company,
            taxCode: req.body.taxCode,
            address: req.body.address,
            phone: req.body.phone,
            representativeRole: req.body.representativeRole,
            logo: req.body.logo
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                taxCode: user.taxCode,
                address: user.address,
                phone: user.phone,
                representativeRole: user.representativeRole,
                logo: user.logo,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
