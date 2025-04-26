const Cart = require('../models/Cart');
const Order = require('../models/Order');

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
      total: cart.total
    });

    await order.save();

    // Delete the cart after order is placed
    await Cart.findOneAndDelete({ user_id: req.user._id });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Error processing checkout' });
  }
}; 