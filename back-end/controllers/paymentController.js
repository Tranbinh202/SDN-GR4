const payOS = require("../config/payos");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

// Tạo thanh toán mới
exports.createPayment = async (req, res) => {
    try {
        const { totalAmount, orderId } = req.body;

        const description = "Thanh toán đơn hàng";

        // Tạo payment link từ PayOS
        const paymentData = await payOS.createPaymentLink({
            orderCode: orderId,
            amount: parseInt(totalAmount),
            description: description,
            returnUrl: process.env.PAYOS_RETURN_URL,
            cancelUrl: process.env.PAYOS_CANCEL_URL
        });

        // Lưu thông tin thanh toán vào database
        const payment = new Payment({
            orderId,
            amount: totalAmount,
            method: "PayOS",
            status: "Pending",
            transactionId: paymentData.checkoutUrl
        });
        await payment.save();

        // Cập nhật trạng thái đơn hàng
        await Order.findByIdAndUpdate(orderId, {
            transactionId: paymentData.checkoutUrl
        });

        res.status(200).json({
            paymentUrl: paymentData.checkoutUrl,
            orderCode: orderId
        });
    } catch (error) {
        console.error("Lỗi khi tạo thanh toán:", error);
        res.status(500).json({ message: "Lỗi khi tạo thanh toán qua PayOS" });
    }
};

// Xử lý webhook từ PayOS
exports.handleWebhook = async (req, res) => {
    try {
        const webhookData = payOS.verifyPaymentWebhookData(req.body);

        if (!webhookData || !webhookData.orderCode) {
            return res.status(400).json({ message: "Dữ liệu webhook không hợp lệ" });
        }

        const { orderCode, status, transactionId } = webhookData;

        // Tìm đơn hàng
        const order = await Order.findById(orderCode).populate("items.productId");
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // Cập nhật trạng thái thanh toán
        let paymentStatus;
        let orderStatus;

        switch (status) {
            case "PAID":
                paymentStatus = "Paid";
                orderStatus = "Confirmed";
                break;
            case "FAILED":
                paymentStatus = "Failed";
                orderStatus = "Cancelled";
                break;
            default:
                paymentStatus = "Pending";
                orderStatus = "Processing";
        }

        // Cập nhật trạng thái thanh toán trong Payment model
        await Payment.findOneAndUpdate(
            { orderId: order._id },
            { status: paymentStatus, transactionId }
        );

        // Nếu thanh toán thành công, cập nhật stock và xóa giỏ hàng
        if (status === "PAID") {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.quantity -= item.quantity;
                    await product.save();
                }
            }

            await Cart.findOneAndDelete({ userId: order.buyerId });

            // Tạo thông báo cho người dùng
            const notification = new Notification({
                userId: order.buyerId,
                type: "Payment",
                message: `Đơn hàng ${order._id} đã được thanh toán thành công.`,
                link: `/orders/${order._id}`
            });
            await notification.save();
        }

        // Cập nhật trạng thái đơn hàng
        order.status = orderStatus;
        await order.save();

        res.status(200).json({ message: "Xử lý webhook thành công", order });
    } catch (error) {
        console.error("Lỗi khi xử lý webhook:", error);
        res.status(500).json({ message: "Lỗi khi xử lý webhook", error: error.message });
    }
};

// Lấy link thanh toán cho đơn hàng
exports.getPaymentLink = async (req, res) => {
    try {
        const { orderId } = req.params;

        const payment = await Payment.findOne({ orderId, status: "Pending" });
        if (!payment) {
            return res.status(404).json({ message: "Không tìm thấy link thanh toán" });
        }

        res.status(200).json({
            message: "Lấy link thanh toán thành công",
            paymentUrl: payment.transactionId
        });
    } catch (error) {
        console.error("Lỗi khi lấy link thanh toán:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi lấy link thanh toán", error: error.message });
    }
};

