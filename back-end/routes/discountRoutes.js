const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Thêm mã giảm giá (chỉ admin)
router.post("/", authMiddleware, adminMiddleware, discountController.addCoupon);

// Cập nhật mã giảm giá (chỉ admin)
router.put("/:id", authMiddleware, adminMiddleware, discountController.updateCoupon);

// Xóa mã giảm giá (chỉ admin)
router.delete("/:id", authMiddleware, adminMiddleware, discountController.deleteCoupon);

// Lấy danh sách mã giảm giá
router.get("/", authMiddleware, adminMiddleware, discountController.getAllCoupons);

// Lấy thông tin mã giảm giá theo ID
router.get("/:id", authMiddleware, discountController.getCouponById);

// Kiểm tra mã giảm giá hợp lệ
router.post("/validate", authMiddleware, discountController.validateCoupon);

module.exports = router;
