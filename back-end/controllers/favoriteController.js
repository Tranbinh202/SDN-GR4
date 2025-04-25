const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const Category = require("../models/Categories");
const mongoose = require("mongoose");

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('product', 'name price images');
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const favorite = new Favorite({
      user: req.user._id,
      product: productId
    });
    await favorite.save();
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    await Favorite.findOneAndDelete({
      user: req.user._id,
      product: productId
    });
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMostFavoriteProductsByCategory = async (req, res) => {
  try {
    let { limit } = req.query;
    limit = parseInt(limit) || 4;

    const categories = await Category.find();
    let categoryFavorites = {};

    for (const category of categories) {
      const favoriteAggregation = await Favorite.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $match: {
            "productDetails.category_id": category._id
          }
        },
        {
          $group: {
            _id: "$product",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      const productIds = favoriteAggregation.map(fav => fav._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .select('name price images category_id');

      categoryFavorites[category._id] = products;
    }

    res.json(categoryFavorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 