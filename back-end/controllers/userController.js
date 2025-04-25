const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "786381256762-26ds2r2qbeus4ekb31nmsf3ji52hosj2.apps.googleusercontent.com"
);

// Đăng ký
exports.register = async (req, res) => {
  const { username, email, password, role, avatarURL } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Tạo token xác minh email
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password,
      role: role || "buyer", // Mặc định là "buyer" nếu không cung cấp
      avatarURL,
      verificationToken,
      isVerified: false,
    });

    await newUser.save();

    // Link xác nhận email
    const verifyUrl = `http://localhost:3000/verify-email/${verificationToken}`;

    // Cấu hình transporter gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Nội dung email
    const mailOptions = {
      from: `"GearUp Support" <${process.env.EMAIL}>`,
      to: email,
      subject: "Xác nhận đăng ký tài khoản",
      html: `<p>Xin chào <b>${username}</b>,</p>
             <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
             <p>Vui lòng nhấn vào liên kết sau để xác nhận email của bạn:</p>
             <a href="${verifyUrl}"><b>Xác nhận email</b></a>
             <p>Trân trọng,</p>
             <p>Đội ngũ hỗ trợ</p>`,
    };

    // Gửi email
    try {
      await transporter.sendMail(mailOptions);
      res.status(201).json({
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      });
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      res.status(500).json({
        message: "Đăng ký thành công nhưng không thể gửi email xác nhận.",
      });
    }
  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);
    res.status(500).json({ error: "Đã xảy ra lỗi, vui lòng thử lại." });
  }
};

// Đăng nhập
exports.login = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ message: "Tài khoản hoặc mật khẩu không đúng" });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          message:
            "Tài khoản của bạn chưa được xác minh. Vui lòng xác minh email của bạn trước khi đăng nhập.",
        });
      }

      if (user.password !== password) {
        return res
          .status(400)
          .json({ message: "Tài khoản hoặc mật khẩu không đúng" });
      }

      // Tạo JWT token nếu đăng nhập thành công
      const token = jwt.sign(
        { _id: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarURL: user.avatarURL || "https://example.com/default-avatar.png",
          isVerified: user.isVerified,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

// Các chức năng khác (getUserById, updateUserProfile, etc.) cũng cần được sửa đổi tương tự để phù hợp với schema mới.