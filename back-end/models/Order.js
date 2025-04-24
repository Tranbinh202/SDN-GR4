const mongoose = require('mongoose');
const { Schema } = mongoose;

// Định nghĩa schema cho từng sản phẩm trong đơn hàng
const OrderItemSchema = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  color: {
    type: String,
    required: true
  },
  variant: {
    type: Map, // Cho phép lưu trữ các key-value động (vd: storage, material, etc.)
    of: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

// Định nghĩa schema cho đơn hàng
const OrderSchema = new Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  shipper_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["Đang xử lý", "Đã xác nhận", "Đang giao", "Đã hoàn thành", "Đã giao", "Đã hủy"],
    default: "Đang xử lý"
  },
  items: {
    type: [OrderItemSchema],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["Chờ thanh toán", "Đã thanh toán", "Thanh toán thất bại"],
    default: "Chờ thanh toán"
  },
  transactionId: {
    type: String,
    default: null
  },
  order_code: {
    type: String,
    required: true,
    unique: true
  },
  returnRequest: {
    reason: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["Đang xử lý", "Đã chấp nhận", "Đã từ chối"],
      default: "Đang xử lý"
    },
    requestDate: {
      type: Date,
      default: null
    }
  }
});

// Middleware để cập nhật thời gian khi cập nhật đơn hàng
OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // Tự động cập nhật trạng thái thanh toán khi đơn hàng được giao thành công và thanh toán bằng tiền mặt
  if (this.status === "Đã giao" && this.paymentMethod === "cash" && this.paymentStatus === "Chờ thanh toán") {
    this.paymentStatus = "Đã thanh toán";
  }
  
  next();
});

// Export model
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
