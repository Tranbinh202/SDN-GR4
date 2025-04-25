const express = require("express");
const {
  register,
  login,
  getAllUsers,
  getUserById,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  blockUser,
  updateUserRole,
  googleLogin,
} = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Đăng ký và đăng nhập
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

// Đăng xuất
router.post("/logout", authMiddleware, logout);

// Lấy danh sách tất cả người dùng (chỉ admin)
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

// Lấy và cập nhật thông tin cá nhân
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// Đổi mật khẩu
router.put("/change-password", authMiddleware, changePassword);

// Quên mật khẩu và đặt lại mật khẩu
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Xác minh email
router.post("/verify-email/:token", verifyEmail);

// Chặn hoặc bỏ chặn người dùng (chỉ admin)
router.patch("/block/:userId", authMiddleware, adminMiddleware, blockUser);

// Cập nhật vai trò người dùng (chỉ admin)
router.patch("/role/:userId", authMiddleware, adminMiddleware, updateUserRole);

// Lấy thông tin người dùng theo ID
router.get("/:id", authMiddleware, getUserById);

module.exports = router;
