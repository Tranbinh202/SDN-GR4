const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Lấy tất cả danh mục
router.get("/", CategoryController.getAllCategories);

// Lấy danh mục theo ID
router.get("/:id", CategoryController.getCategoryById);

// Tạo danh mục mới (chỉ admin)
router.post("/", authMiddleware, adminMiddleware, CategoryController.createCategory);

// Cập nhật danh mục theo ID (chỉ admin)
router.put("/:id", authMiddleware, adminMiddleware, CategoryController.updateCategory);

// Xóa danh mục theo ID (chỉ admin)
router.delete("/:id", authMiddleware, adminMiddleware, CategoryController.deleteCategory);

module.exports = router;
