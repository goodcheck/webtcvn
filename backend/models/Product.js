const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    // Chỉ tiêu cảm quan
    sensoryIndicators: {
        color: { type: String, default: '' },
        smell: { type: String, default: '' },
        taste: { type: String, default: '' },
        texture: { type: String, default: '' }
    },
    // Chỉ tiêu lý hóa
    physicalChemical: [{
        indicator: String,
        value: String,
        method: String
    }],
    // Chỉ tiêu vi sinh
    microbiological: [{
        indicator: String,
        limit: String,
        method: String
    }],
    // Kim loại nặng
    heavyMetals: [{
        indicator: String,
        limit: String,
        method: String
    }],
    // Độc tố vi nấm
    mycotoxins: [{
        indicator: String,
        limit: String,
        method: String
    }],
    // Yêu cầu kiểm nghiệm
    testingRequirements: [{
        stt: Number,
        indicator: String,
        method: String,
        cost: Number,
        category: String // 'CHẤT LƯỢNG', 'VI SINH', 'KIM LOẠI NẶNG'
    }],
    // Yêu cầu bao bì
    packagingRequirements: {
        type: String,
        standard: String,
        features: String
    },
    // Yêu cầu ghi nhãn
    labelingRequirements: [{
        requirement: String,
        detail: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
