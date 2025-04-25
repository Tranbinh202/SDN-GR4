const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const http = require("http");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const shippingRoutes = require("./routes/shippingRoutes");
// const userRoutes = require("./routes/userRoutes");
const { setupSwagger } = require("./swagger/swagger-config");
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Thiết lập Swagger
setupSwagger(app);

// app.use("/api/users", userRoutes);

app.use("/api/shipping", shippingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
