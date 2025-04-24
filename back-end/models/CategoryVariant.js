const mongoose = require('mongoose');

const categoryVariantSchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    variant_type: {
        type: String,
        required: true,
        enum: ['storage', 'ram', 'size'] // các loại variant có thể có
    }
});

module.exports = mongoose.model('CategoryVariant', categoryVariantSchema); 