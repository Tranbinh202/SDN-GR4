const Order = require('../models/Orders');
const { sendPaymentConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');

// Update order status and send email notification
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status
        order.status = status;
        order.updatedAt = new Date();
        await order.save();

        // Send email notification
        await sendOrderStatusUpdateEmail(order.userEmail, {
            orderId: order._id,
            status: order.status
        });

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Handle successful payment and send confirmation email
const handleSuccessfulPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update payment status
        order.paymentStatus = 'paid';
        order.paymentMethod = paymentMethod;
        order.paymentDate = new Date();
        await order.save();

        // Send payment confirmation email
        await sendPaymentConfirmationEmail(order.userEmail, {
            orderId: order._id,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod
        });

        res.json({ message: 'Payment processed successfully', order });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
};

module.exports = {
    updateOrderStatus,
    handleSuccessfulPayment
}; 