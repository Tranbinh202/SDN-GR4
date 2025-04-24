const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  // Các trường động cho attributes
  storage: { type: String },
  screen_size: { type: String },
  battery: { type: String },
  battery_life: { type: String },
  type: { type: String },
  material: { type: String },
  length: { type: String },
  connectivity: { type: String },
  waterproof: { type: String },
  
  // Các trường bắt buộc
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
  colors: { type: [String], required: true },
  images: [{ type: String }],
  variants: [variantSchema],
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
