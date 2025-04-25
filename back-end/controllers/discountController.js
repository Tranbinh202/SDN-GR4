const Coupon = require("../models/Coupon");

// Thêm mã giảm giá mới
exports.addCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json({ message: "Mã giảm giá đã được thêm!", coupon });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Cập nhật mã giảm giá
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCoupon) return res.status(404).json({ message: "Không tìm thấy mã giảm giá!" });
        res.status(200).json({ message: "Cập nhật thành công!", updatedCoupon });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Xóa mã giảm giá
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) return res.status(404).json({ message: "Không tìm thấy mã giảm giá!" });
        res.status(200).json({ message: "Xóa mã giảm giá thành công!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lấy danh sách mã giảm giá
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy thông tin mã giảm giá theo ID
exports.getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        if (!coupon) return res.status(404).json({ message: "Không tìm thấy mã giảm giá!" });
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Kiểm tra mã giảm giá hợp lệ
exports.validateCoupon = async (req, res) => {
    try {
        const { code, productId } = req.body;

        const coupon = await Coupon.findOne({ code, productId });
        if (!coupon) {
            return res.status(404).json({ message: "Mã giảm giá không hợp lệ!" });
        }

        const currentDate = new Date();
        if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
            return res.status(400).json({ message: "Mã giảm giá đã hết hạn!" });
        }

        res.status(200).json({ message: "Mã giảm giá hợp lệ!", coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

