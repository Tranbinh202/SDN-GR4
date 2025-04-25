const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate({
                path: "items.productId",
                populate: {
                    path: "categoryId",
                    select: "name"
                }
            })
            .lean();

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(200).json({ message: "Giỏ hàng trống", items: [] });
        }

        const formattedCart = cart.items.map((item) => {
            const product = item.productId;
            if (!product) return null;

            return {
                _id: item._id,
                productId: product._id,
                name: product.title,
                categoryName: product.categoryId?.name || "Không xác định",
                image: product.images.length > 0 ? product.images[0] : "",
                price: item.price,
                quantity: item.quantity,
                total: item.quantity * item.price
            };
        }).filter(item => item !== null);

        res.status(200).json({ items: formattedCart });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi hệ thống. Vui lòng thử lại." });
    }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const existingItem = cart.items.find(item => 
            item.productId.equals(productId) && item.price === product.price
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const cartItem = {
                productId: product._id,
                price: product.price,
                quantity: quantity || 1
            };

            cart.items.push(cartItem);
        }

        await cart.save();
        res.json({ message: "Sản phẩm đã được thêm vào giỏ hàng", cart });
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.json({ message: "Cập nhật giỏ hàng thành công", cart });
    } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng:", error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => !item.productId.equals(productId));

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });
        }

        await cart.save();
        res.json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng", cart });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).json({ message: error.message });
    }
};
