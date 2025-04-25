const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const http = require("http");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
// const userRoutes = require("./routes/userRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use("/api/users", userRoutes);

// app.use("/api/shipping", shippingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
