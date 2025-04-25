const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/ShippingController");
const { authMiddleware } = require("../middleware/auth");

// Tạo vận đơn mới cho đơn hàng
router.post(
  "/shipping/:orderId",
  authMiddleware,
  shippingController.createShipment
);

// Lấy thông tin vận chuyển theo mã vận đơn
router.get(
  "/shipping/tracking/:trackingNumber",
  shippingController.getShipmentByTracking
);

// Lấy vị trí hiện tại của shipper
router.get(
  "/shipping/location/:trackingNumber",
  shippingController.getShipperLocation
);

// Cập nhật trạng thái vận chuyển (thủ công)
router.put(
  "/shipping/:trackingNumber",
  authMiddleware,
  shippingController.updateShipmentStatus
);

module.exports = router;
