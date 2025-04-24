const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Đảm bảo liên kết với bảng User
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Đảm bảo liên kết với bảng Product
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "removed"],  // Thêm trạng thái "removed"
    default: "pending",
  },
  isVisible: {  // Trạng thái hiển thị cho khách hàng
    type: Boolean,
    default: true,
  },
  answers: [
    {
      sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Sale cũng là User
      },
      answer: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
