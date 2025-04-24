const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  phone: { type: String },
  address: { type: String },
  image: {
    type: String,
    default: "https://example.com/default-avatar.png",
  },
  isBanned: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Trạng thái xác minh email
  verificationToken: { type: String }, // Token xác minh email
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  googleId: {
    type: String,
    sparse: true // Cho phép null và unique khi có giá trị
  },
  loginType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
});



module.exports = mongoose.model("User", userSchema);
