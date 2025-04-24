const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Đảm bảo mỗi customer chỉ có 1 conversation
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false }, // Trạng thái đọc tin nhắn
    },
  ],
  lastMessage: {
    text: String,
    timestamp: Date,
  },
  unreadCount: { type: Number, default: 0 }, // Số lượng tin nhắn chưa đọc
});

module.exports = mongoose.model("Conversation", conversationSchema);
