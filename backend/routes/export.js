const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const {
    generateTCCS,
    generateTestingForm,
    generateDeclaration,
    generateLabel,
    generateAllDocuments
} = require('../utils/exportDocuments');

// @route   POST /api/export/tccs
// @desc    Export TCCS document
// @access  Private
router.post('/tccs', protect, async (req, res, next) => {
    try {
        const { productId, format = 'docx' } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const file = await generateTCCS(product, format, req.user);

        res.json({
            success: true,
            message: 'Tạo file TCCS thành công',
            data: {
                filename: file.filename,
                downloadUrl: `/api/export/download/${file.filename}`
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/export/testing
// @desc    Export testing form
// @access  Private
router.post('/testing', protect, async (req, res, next) => {
    try {
        const { productId, format = 'xlsx' } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const file = await generateTestingForm(product, format);

        res.json({
            success: true,
            message: 'Tạo phiếu kiểm nghiệm thành công',
            data: {
                filename: file.filename,
                downloadUrl: `/api/export/download/${file.filename}`
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/export/declaration
// @desc    Export declaration form
// @access  Private
router.post('/declaration', protect, async (req, res, next) => {
    try {
        const { productId, format = 'docx' } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const file = await generateDeclaration(product, format, req.user);

        res.json({
            success: true,
            message: 'Tạo hồ sơ công bố thành công',
            data: {
                filename: file.filename,
                downloadUrl: `/api/export/download/${file.filename}`
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/export/label
// @desc    Export label template
// @access  Private
router.post('/label', protect, async (req, res, next) => {
    try {
        const { productId, format = 'pdf' } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const file = await generateLabel(product, format);

        res.json({
            success: true,
            message: 'Tạo mẫu nhãn thành công',
            data: {
                filename: file.filename,
                downloadUrl: `/api/export/download/${file.filename}`
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/export/all
// @desc    Export all documents as ZIP
// @access  Private
router.post('/all', protect, async (req, res, next) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const file = await generateAllDocuments(product, req.user);

        res.json({
            success: true,
            message: 'Tạo trọn bộ hồ sơ thành công',
            data: {
                filename: file.filename,
                downloadUrl: `/api/export/download/${file.filename}`
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
