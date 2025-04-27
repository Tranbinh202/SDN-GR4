const Order = require("../models/Orders");
const {
  sendPaymentConfirmationEmail,
  sendOrderStatusUpdateEmail,
} = require("../services/emailService");

// Hàm kiểm tra và cập nhật trạng thái đơn hàng
const checkAndUpdateOrderStatus = async () => {
  let updatedCount = 0;
  try {
    // Lấy tất cả đơn hàng đang chờ xử lý
    const pendingOrders = await Order.find({ 
      status: { $in: ['pending', 'processing', 'shipped'] } 
    });

    for (const order of pendingOrders) {
      try {
        // Kiểm tra và cập nhật trạng thái dựa trên thời gian
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

        let newStatus = order.status;
        
        // Logic cập nhật trạng thái dựa trên thời gian
        if (order.status === 'pending' && hoursDiff >= 1) {
          newStatus = 'processing';
        } else if (order.status === 'processing' && hoursDiff >= 24) {
          newStatus = 'shipped';
        } else if (order.status === 'shipped' && hoursDiff >= 48) {
          newStatus = 'delivered';
        }

        // Nếu trạng thái thay đổi
        if (newStatus !== order.status) {
          order.status = newStatus;
          await order.save();
          updatedCount++;

          // Gửi email thông báo
          await sendOrderStatusUpdateEmail(order.userEmail, {
            orderId: order._id,
            status: newStatus
          });

          console.log(`Đã cập nhật trạng thái đơn hàng ${order._id} thành ${newStatus}`);
        }
      } catch (error) {
        console.error(`Lỗi khi cập nhật đơn hàng ${order._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái đơn hàng:', error);
  }
  return { updatedCount };
};

// Hàm cập nhật trạng thái đơn hàng thủ công
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Gửi email thông báo
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
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status
    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod;
    order.paymentDate = new Date();
    await order.save();

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(order.userEmail, {
      orderId: order._id,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
    });

    res.json({ message: "Payment processed successfully", order });
  } catch (error) {
    console.error("Error processing payment:", error);
    res
      .status(500)
      .json({ message: "Error processing payment", error: error.message });
  }
};

module.exports = {
  checkAndUpdateOrderStatus,
  updateOrderStatus,
  handleSuccessfulPayment,
};
