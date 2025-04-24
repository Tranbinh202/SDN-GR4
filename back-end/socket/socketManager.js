const Order = require("./models/Order");
const Notification = require("./models/Notification");

let io;

// Khởi tạo socket.io server
const initSocket = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Xử lý kết nối socket
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Theo dõi đơn hàng cụ thể
    socket.on("joinOrderRoom", (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`User ${socket.id} joined order room: order_${orderId}`);
    });

    // Theo dõi tất cả đơn hàng của người dùng
    socket.on("joinUserOrdersRoom", (userId) => {
      socket.join(`user_orders_${userId}`);
      console.log(
        `User ${socket.id} joined user orders room: user_orders_${userId}`
      );
    });

    // Ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.IO initialized successfully");
  return io;
};

// Hủy đơn hàng sau khi hết thời gian thanh toán
const cancelOrderAfterTimeout = async (orderId, userId) => {
  try {
    // Kiểm tra đơn hàng có tồn tại không
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Order ${orderId} not found for cancellation`);
      return;
    }

    // Kiểm tra nếu đơn hàng vẫn đang chờ thanh toán
    if (
      order.paymentStatus === "Chờ thanh toán" &&
      (order.status === "Đang xử lý" || order.status === "Đã xác nhận")
    ) {
      console.log(`Cancelling order ${orderId} due to payment timeout`);

      // Cập nhật trạng thái đơn hàng
      order.status = "Đã hủy";
      order.paymentStatus = "Thanh toán thất bại";
      order.cancelReason = "Hết thời gian thanh toán";
      order.cancelledBy = "Hệ thống";
      order.cancelledAt = new Date();

      await order.save();

      // Tạo thông báo cho người dùng
      const notification = new Notification({
        user: userId,
        type: "order",
        message: `Đơn hàng #${order.order_code} đã bị hủy tự động do quá thời gian thanh toán`,
        link: `/orders/${orderId}`,
        isRead: false,
      });
      await notification.save();

      // Thông báo qua socket.io
      if (io) {
        // Thông báo cho phòng của đơn hàng cụ thể
        io.to(`order_${orderId}`).emit("orderCancelled", {
          orderId: orderId,
          orderCode: order.order_code,
          reason: "Hết thời gian thanh toán",
          timestamp: new Date(),
        });

        // Thông báo cho phòng của người dùng
        io.to(`user_orders_${userId}`).emit("orderStatusChanged", {
          orderId: orderId,
          orderCode: order.order_code,
          status: "Đã hủy",
          reason: "Hết thời gian thanh toán",
          timestamp: new Date(),
        });
      }

      console.log(
        `Order ${orderId} has been automatically cancelled due to payment timeout`
      );
    } else {
      console.log(
        `Order ${orderId} is not eligible for automatic cancellation. Status: ${order.status}, Payment Status: ${order.paymentStatus}`
      );
    }
  } catch (error) {
    console.error(`Error when cancelling order ${orderId}:`, error);
  }
};

// Set up timeout for order cancellation
const setOrderPaymentTimeout = (orderId, userId, timeoutMs = 60000) => {
  console.log(`Setting payment timeout for order ${orderId}: ${timeoutMs}ms`);

  setTimeout(() => {
    cancelOrderAfterTimeout(orderId, userId);
  }, timeoutMs);
};

module.exports = {
  initSocket,
  setOrderPaymentTimeout,
  getIO: () => io,
};
