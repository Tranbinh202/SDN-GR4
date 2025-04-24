const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // Đảm bảo mã giảm giá không bị trùng
        uppercase: true // Chuyển mã thành chữ in hoa
    },
    description: {
        type: String,
        required: true // Mô tả chi tiết về mã giảm giá
    },
    discount_type: {
        type: String,
        enum: ["percentage", "fixed"], // Giảm giá theo % hoặc giá trị cố định
        required: true
    },
    discount_value: {
        type: Number,
        required: true // Giá trị giảm giá, ví dụ: 25 (25%) hoặc 100000 VND
    },
    min_order_value: {
        type: Number,
        required: true, // Giá trị đơn hàng tối thiểu để áp dụng mã
        default: 0
    },
    max_discount: {
        type: Number,
        default: 0 // Mức giảm tối đa áp dụng cho loại phần trăm
    },
    start_date: {
        type: Date,
        required: true // Ngày bắt đầu hiệu lực của mã giảm giá
    },
    end_date: {
        type: Date,
        required: true // Ngày hết hạn của mã giảm giá
    },
    usage_limit: {
        type: Number,
        default: 1 // Số lần sử dụng tối đa
    },
    used_count: {
        type: Number,
        default: 0 // Số lần mã đã được sử dụng
    },
    active: {
        type: Boolean,
        default: false // Trạng thái mã giảm giá (còn hiệu lực hay không)
    },
}, 
{
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model("DiscountCode", discountCodeSchema);
