import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa"; // Import icon trái tim
import "./ListProduct.css";

const API_BASE_URL = "http://localhost:9999/api";

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/products?page=${page}&limit=8`);
      console.log('Products response:', response.data); // Debug log
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Lỗi khi tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchCategories();
    if (token) {
      fetchFavorites();
    }
  }, [token]);

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
    // First check if product has a colors array
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      return [...new Set(product.colors)];
    }
    
    // If not, try to get colors from variants
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

  const getLowestPrice = (variants) => {
    if (!variants || !Array.isArray(variants) || variants.length === 0) return 0;
    const prices = variants
      .filter(variant => variant && typeof variant.price === 'number')
      .map(variant => variant.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const toggleFavorite = async (productId, productName) => {
    if (!token) {
      window.alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      return;
    }

    const isFavorited = favorites.includes(productId);
    try {
      if (isFavorited) {
        await axios.post(
          `${API_BASE_URL}/favorites/remove`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites(favorites.filter((id) => id !== productId));
        window.alert(`Đã xóa "${productName}" khỏi danh sách yêu thích!`);
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites/add`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, productId]);
        window.alert(`Đã thêm "${productName}" vào danh sách yêu thích!`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
      window.alert("Có lỗi xảy ra, vui lòng thử lại sau!");
    }
  };

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;
  if (!products || products.length === 0) return <Alert variant="info" className="text-center">Không có sản phẩm nào</Alert>;

  return (
    <div className="list-product-container">
      <h2 className="list-product-title">Danh sách sản phẩm</h2>
      <div className="product-grid">
        {products.map((product) => {
          if (!product) return null;
          return (
            <div key={product._id || 'unknown'} className="product-card">
              <div className="product-image-wrapper">
                <img
                  src={product.images?.[0] || '/default-product.png'}
                  alt={product.name || 'Sản phẩm'}
                  className="product-image"
                  onClick={() => product._id && navigate(`/product/${product._id}`)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-product.png';
                  }}
                  loading="lazy"
                />
              </div>

              <div className="product-info">
                <h3>{product.name || 'Chưa có tên'}</h3>
                <p><strong>Thương hiệu:</strong> {getBrandName(product.brand)}</p>
                <p><strong>Màu sắc:</strong> {getColorsFromVariants(product).join(", ")}</p>
                <p>
                  <strong>Giá từ:</strong>{" "}
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(getLowestPrice(product.variants))}
                </p>
              </div>

              {token && (
                <button
                  className={`favorite-button ${favorites.includes(product._id) ? "favorited" : ""}`}
                  onClick={() => product._id && toggleFavorite(product._id, product.name || 'Sản phẩm')}
                >
                  <FaHeart size={24} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination_lp">
          <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
            ⬅ Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => changePage(i + 1)}
              className={currentPage === i + 1 ? "active_lp" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
            Tiếp ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
