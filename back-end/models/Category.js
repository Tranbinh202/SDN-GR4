const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parent_category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  sub_categories: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Tạo ObjectId tự động
      name: { type: String, required: true }
    }
  ],
  attributes: [
    {
      key: { type: String, required: true },
      values: [{ type: String, required: true }]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", categorySchema);
