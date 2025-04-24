const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const discountRoutes = require("./routes/discountRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const questionRoutes = require("./routes/questionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const postRoutes = require("./routes/postRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const shippingRoutes = require("./routes/shippingRoutes"); // Thêm routes vận chuyển
const http = require("http");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api", productRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api", shippingRoutes);

const server = http.createServer(app);

const socketManager = require("./socketManager");
socketManager.initSocket(server);

// Kiểm tra và cập nhật trạng thái đơn hàng định kỳ (chạy mỗi 30 giây)
const OrderController = require("./controllers/OrderController");
setInterval(async () => {
  try {
    console.log("Đang kiểm tra trạng thái đơn hàng...");
    const result = await OrderController.checkAndUpdateOrderStatus();
    if (result.updatedCount > 0) {
      console.log(`Đã cập nhật ${result.updatedCount} đơn hàng`);
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
  }
}, 30000);

const PORT = process.env.PORT || 9999;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
