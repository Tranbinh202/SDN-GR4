import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./ListProduct.css"; // Dùng chung CSS với ListProduct

const API_BASE_URL = "http://localhost:9999/api";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]); // 🟢 Lưu danh mục để tìm brand name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Dữ liệu yêu thích:", response.data.favorites);
        setFavorites(response.data.favorites);
      } catch (err) {
        setError("Lỗi khi tải danh sách yêu thích!");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };

    if (token) {
      Promise.all([fetchFavorites(), fetchCategories()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setError("Bạn cần đăng nhập để xem danh sách yêu thích!");
      setLoading(false);
    }
  }, [token]);

  // 🟢 Hàm tìm tên thương hiệu từ `sub_categories`
  const getBrandName = (brandId) => {
    for (const category of categories) {
      const subCategory = category.sub_categories.find(sub => sub._id === brandId);
      if (subCategory) return subCategory.name;
    }
    return "Không xác định";
  };

  const removeFavorite = async (productId, productName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${productName}" khỏi danh sách yêu thích?`)) {
      try {
        await axios.post(
          `${API_BASE_URL}/favorites/remove`,
          { productId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFavorites(favorites.filter((product) => product._id !== productId));
        window.alert(`Đã xóa "${productName}" khỏi danh sách yêu thích!`);
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:", error);
        window.alert("Có lỗi xảy ra, vui lòng thử lại sau!");
      }
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error)
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );

  return (
    <div className="list-product-container">
      <h2 className="list-product-title">Danh sách yêu thích</h2>
      <div className="product-grid">
        {favorites.map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => navigate(`/product/${product._id}`)}
            style={{ cursor: "pointer" }}
          >
            <img src={product.images?.[0]} alt={product.name} className="product-image" />

            {/* Hiển thị thông tin sản phẩm */}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p><strong>Thương hiệu:</strong> {getBrandName(product.brand)}</p>
              <p><strong>Màu sắc:</strong> {product.colors?.join(", ")}</p>
              <p><strong>Giá từ:</strong> {new Intl.NumberFormat().format(product.variants?.[0]?.price || 0)} VND</p>
            </div>

            {/* Nút xóa sản phẩm khỏi danh sách yêu thích */}
            <div className="favorite-actions">
              <button
                className="btn btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(product._id, product.name);
                }}
              >
                Xóa khỏi yêu thích
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
