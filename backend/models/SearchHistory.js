const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    searchedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
searchHistorySchema.index({ user: 1, searchedAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
