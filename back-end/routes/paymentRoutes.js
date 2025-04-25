const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/auth");

// Nhận webhook từ PayOS
router.post("/webhook", paymentController.handleWebhook);

// Tạo thanh toán mới
router.post("/create", authMiddleware, paymentController.createPayment);

// Xử lý callback từ PayOS
router.post("/callback", paymentController.handlePayOSCallback);

// Lấy link thanh toán cho đơn hàng
router.get("/link/:orderId", authMiddleware, paymentController.getPaymentLink);

// Sửa các đơn hàng thanh toán thất bại
router.post("/fix-failed-orders", authMiddleware, paymentController.fixFailedPaymentOrders);

module.exports = router;
