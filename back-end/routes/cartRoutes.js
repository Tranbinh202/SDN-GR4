const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");
const { authMiddleware } = require("../middleware/auth");

// Lấy giỏ hàng của người dùng
router.get("/", authMiddleware, CartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/", authMiddleware, CartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/:productId", authMiddleware, CartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/:productId", authMiddleware, CartController.removeFromCart);

module.exports = router;