const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/SearchHistory');
const { protect } = require('../middleware/auth');

// @route   GET /api/history
// @desc    Get user search history
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await SearchHistory.countDocuments({ user: req.user._id });
        const history = await SearchHistory.find({ user: req.user._id })
            .populate('product', 'name code category')
            .skip(skip)
            .limit(limit)
            .sort({ searchedAt: -1 });

        res.json({
            success: true,
            count: history.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: history
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/history
// @desc    Save search to history
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        const { productId, productName } = req.body;

        // Check if already exists in recent history (last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await SearchHistory.findOne({
            user: req.user._id,
            product: productId,
            searchedAt: { $gte: oneDayAgo }
        });

        if (existing) {
            // Update timestamp
            existing.searchedAt = Date.now();
            await existing.save();

            return res.json({
                success: true,
                message: 'Cập nhật lịch sử tìm kiếm',
                data: existing
            });
        }

        // Create new history entry
        const history = await SearchHistory.create({
            user: req.user._id,
            product: productId,
            productName
        });

        res.status(201).json({
            success: true,
            message: 'Lưu lịch sử tìm kiếm thành công',
            data: history
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/history/:id
// @desc    Delete history item
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const history = await SearchHistory.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch sử'
            });
        }

        await history.deleteOne();

        res.json({
            success: true,
            message: 'Xóa lịch sử thành công'
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/history
// @desc    Clear all history
// @access  Private
router.delete('/', protect, async (req, res, next) => {
    try {
        await SearchHistory.deleteMany({ user: req.user._id });

        res.json({
            success: true,
            message: 'Xóa toàn bộ lịch sử thành công'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
