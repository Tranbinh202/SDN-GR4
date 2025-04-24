import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import "./MostFavoriteProducts.css"; // Dùng chung CSS với ListProduct

const API_BASE_URL = "http://localhost:9999/api";

const MostFavoriteProducts = () => {
  const [categoryFavorites, setCategoryFavorites] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]); // Lưu danh mục
  const navigate = useNavigate();
  const scrollRefs = useRef({});
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    fetchMostFavoriteProducts();
    fetchFavorites();
    fetchCategories();
  }, []);

  const fetchMostFavoriteProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/mostfavorite/by-category`);
      setCategoryFavorites(response.data.categoryFavorites);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm yêu thích nhất:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

  const fetchFavorites = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites.map((fav) => fav._id));
    } catch (err) {
      console.error("Lỗi khi tải danh sách yêu thích:", err);
    }
  };

  const toggleFavorite = async (productId, productName) => {
    if (!token) {
      window.alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      return;
    }

    const isFavorited = favorites.includes(productId);
    try {
      if (isFavorited) {
        await axios.post(`${API_BASE_URL}/favorites/remove`, { productId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(favorites.filter((id) => id !== productId));
      } else {
        await axios.post(`${API_BASE_URL}/favorites/add`, { productId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites([...favorites, productId]);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
    }
  };

  const getBrandName = (brandId) => {
    if (!brandId || !categories) return "Không xác định";
    for (const category of categories) {
      if (category?.sub_categories) {
        const subCategory = category.sub_categories.find(sub => sub?._id === brandId);
        if (subCategory?.name) return subCategory.name;
      }
    }
    return "Không xác định";
  };

  const getColorsFromVariants = (product) => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      return [...new Set(product.colors)];
    }

    if (product.variants && Array.isArray(product.variants)) {
      const variantColors = product.variants
        .filter(variant => variant && variant.color)
        .map(variant => variant.color);
      if (variantColors.length > 0) {
        return [...new Set(variantColors)];
      }
    }

    return ["Không có"];
  };

  return (
    <div className="list-product-container">
      <h2 className="list-product-title">Sản phẩm được yêu thích nhất theo danh mục</h2>
      {Object.entries(categoryFavorites).map(([category, products]) => (
        <div key={category} className="category-section">
          <h3 className="category-title">{category}</h3>
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={product.images?.[0] || "/default-product.png"}
                  alt={product.name}
                  className="product-image"
                  onClick={() => navigate(`/product/${product._id}`)}
                />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p><strong>Thương hiệu:</strong> {getBrandName(product.brand)}</p>
                  <p><strong>Màu sắc:</strong> {getColorsFromVariants(product).join(", ")}</p>
                </div>
                <button
                  className={`favorite-button ${favorites.includes(product._id) ? "favorited" : ""}`}
                  onClick={() => toggleFavorite(product._id, product.name)}
                >
                  <FaHeart size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MostFavoriteProducts;
