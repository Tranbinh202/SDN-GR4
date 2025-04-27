const Cart = require("../models/Cart");
const Order = require("../models/Orders");
const { sendPaymentConfirmationEmail } = require('../services/emailService');

exports.checkout = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    
    // Validate required fields
    if (!fullName || !phone || !address) {
      return res.status(400).json({ message: 'Please provide all required shipping information' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create new order
    const order = new Order({
      customer_id: req.user._id,
      items: cart.items,
      fullName,
      phone,
      address,
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending"
    });

    await order.save();

    // Delete the cart after order is placed
    await Cart.findOneAndDelete({ user_id: req.user._id });

    // Gửi email xác nhận đơn hàng
    await sendPaymentConfirmationEmail(req.user.email, {
      orderId: order._id,
      totalAmount: order.total,
      paymentMethod: req.body.paymentMethod || 'cash'
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Error processing checkout' });
  }
};
