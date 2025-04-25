const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth"); // Xác thực người dùng và quyền admin

// Lấy danh sách đơn hàng của người dùng
router.get("/customer", authMiddleware, OrderController.getOrdersByCustomerId);

// Lấy tất cả đơn hàng (chỉ admin)
router.get("/", authMiddleware, adminMiddleware, OrderController.getAllOrders);

// Tạo đơn hàng mới
router.post("/", authMiddleware, OrderController.createOrder);

// Cập nhật trạng thái thanh toán của đơn hàng
router.patch("/:orderId/payment-status", authMiddleware, OrderController.updatePaymentStatus);

// Cập nhật trạng thái đơn hàng
router.put("/:orderId/status", authMiddleware, OrderController.updateOrderStatus);

// Xác nhận đơn hàng thành công
router.put("/:orderId/confirm-success", authMiddleware, OrderController.confirmOrderSuccess);

// Yêu cầu trả hàng
router.post("/:orderId/return", authMiddleware, OrderController.requestOrderReturn);

// Tra cứu bảo hành (yêu cầu đăng nhập)
router.get("/warranty", authMiddleware, OrderController.checkWarranty);

// Tra cứu bảo hành công khai (không yêu cầu đăng nhập)
router.get("/warranty/public", OrderController.checkWarrantyPublic);

module.exports = router;
