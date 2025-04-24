import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WarrantyCheck.css';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import { Link } from 'react-router-dom';


function WarrantyCheck() {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedInSearch, setIsLoggedInSearch] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const userToken = localStorage.getItem('authToken');
    if (userToken) {
      setIsAuthenticated(true);
      setToken(userToken);
      setIsLoggedInSearch(true);
    }
    
    // Fetch categories for brand name display
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/api/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    
    fetchCategories();
  }, []);

  const getBrandName = (brandId) => {
    for (const category of categories) {
      const subCategory = category.sub_categories.find(sub => sub._id === brandId);
      if (subCategory) return subCategory.name;
    }
    return "Không xác định";
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSelectedItem(null);
    
    try {
      let response;
      
      if (isLoggedInSearch && isAuthenticated) {
        // Tìm kiếm với tài khoản đã đăng nhập
        response = await axios.get(`http://localhost:9999/api/warranty?orderCode=${orderCode}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Tìm kiếm công khai với mã đơn hàng và số điện thoại
        if (!orderCode || !phone) {
          setError('Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại');
          setLoading(false);
          return;
        }
        
        response = await axios.get(`http://localhost:9999/api/warranty/public?orderCode=${orderCode}&phone=${phone}`);
      }
      
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Lỗi khi tra cứu bảo hành:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tra cứu thông tin bảo hành');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };
  
  const closeDetails = () => {
    setSelectedItem(null);
  };

  // Thêm CSS cho phiên bản in
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      
      .warranty__modal-content, .warranty__modal-content * {
        visibility: visible;
      }
      
      .warranty__modal-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 20px;
      }
      
      .warranty__modal-close,
      .warranty__modal-actions {
        display: none !important;
      }
      
      .warranty__modal {
        position: absolute;
        background: white;
        height: auto;
        overflow: visible;
      }
      
      .warranty__modal-header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      
      .warranty__modal-title {
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      
      .warranty__modal-product {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .warranty__modal-image {
        width: 200px;
      }
      
      .warranty__modal-image img {
        width: 100%;
        height: auto;
      }
      
      .warranty__modal-info {
        flex: 1;
      }
      
      .warranty__modal-name {
        font-size: 20px;
        margin-bottom: 15px;
      }
      
      .warranty__modal-section {
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      
      .warranty__modal-section-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }
      
      .warranty__modal-detail {
        margin-bottom: 8px;
        display: flex;
      }
      
      .warranty__modal-label {
        min-width: 150px;
        font-weight: bold;
      }
      
      .warranty__modal-policy {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ccc;
      }
      
      .warranty__modal-policy-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .warranty__modal-policy-list {
        padding-left: 20px;
      }
      
      .warranty__modal-policy-item {
        margin-bottom: 5px;
      }
    }
  `;

  // Thêm style element vào component
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Hàm in hóa đơn
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Header />
      <div className="warranty-container">
        <div className="warranty">
          <h2 className="warranty__title">Tra cứu thông tin bảo hành</h2>
          
          <div className="warranty__toggle">
            <button 
              className={`warranty__toggle-btn ${isLoggedInSearch ? "warranty__toggle-btn--active" : ""}`}
              onClick={() => setIsLoggedInSearch(true)}
              disabled={!isAuthenticated}
            >
              Tra cứu với tài khoản
            </button>
            <button 
              className={`warranty__toggle-btn ${!isLoggedInSearch ? "warranty__toggle-btn--active" : ""}`}
              onClick={() => setIsLoggedInSearch(false)}
            >
              Tra cứu không cần đăng nhập
            </button>
          </div>
          
          {!isAuthenticated && isLoggedInSearch && (
            <div className="warranty__login-notice">
              Bạn cần <a href="/login" className="warranty__login-link">đăng nhập</a> để sử dụng chức năng này
            </div>
          )}
          
          <form onSubmit={handleSearch} className="warranty__form">
            <div className="warranty__form-group">
              <label htmlFor="orderCode" className="warranty__label">Mã đơn hàng:</label>
              <input
                type="text"
                id="orderCode"
                className="warranty__input"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Nhập mã đơn hàng"
                required
              />
            </div>
            
            {!isLoggedInSearch && (
              <div className="warranty__form-group">
                <label htmlFor="phone" className="warranty__label">Số điện thoại:</label>
                <input
                  type="text"
                  id="phone"
                  className="warranty__input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại đặt hàng"
                  required
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="warranty__search-btn"
              disabled={loading || (isLoggedInSearch && !isAuthenticated)}
            >
              {loading ? 'Đang tìm kiếm...' : 'Tra cứu'}
            </button>
          </form>
          
          {error && <div className="warranty__error">{error}</div>}
          
          {searchResults && (
            <div className="warranty__results">
              <h3 className="warranty__results-title">Kết quả tra cứu bảo hành</h3>
              
              <div className="warranty__items">
                {Array.isArray(searchResults) ? searchResults.map((item, index) => (
                  <div key={index} className="warranty__item">
                    <div className="warranty__item-image">
                      <img 
                        src={item.productInfo.mainImage || '/placeholder.png'} 
                        alt={item.productInfo.name} 
                        className="warranty__item-img" 
                      />
                    </div>
                    <div className="warranty__item-details">
                      <h4 className="warranty__item-name">{item.productInfo.name}</h4>
                      <p className="warranty__item-info">
                        <strong>Mã đơn hàng:</strong> {item.orderInfo.orderCode}
                      </p>
                      <p className="warranty__item-info">
                        <strong>Ngày mua:</strong> {formatDate(item.orderInfo.purchaseDate)}
                      </p>
                      <p className="warranty__item-info">
                        <strong>Hết hạn bảo hành:</strong> {formatDate(item.warrantyInfo.endDate)}
                      </p>
                      <p className={`warranty__item-status ${
                        item.warrantyInfo.isActive ? "warranty__item-status--active" : "warranty__item-status--expired"
                      }`}>
                        <strong>Trạng thái:</strong> {item.warrantyInfo.status}
                        {item.warrantyInfo.isActive && ` (còn ${item.warrantyInfo.daysLeft} ngày)`}
                      </p>
                      <button 
                        className="warranty__item-btn" 
                        onClick={() => handleViewDetails(item)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="warranty__error">Không tìm thấy kết quả phù hợp</div>
                )}
              </div>
            </div>
          )}
          
          {/* Modal chi tiết sản phẩm */}
          {selectedItem && (
            <div className="warranty__modal">
              <div className="warranty__modal-content">
                <span className="warranty__modal-close" onClick={closeDetails}>&times;</span>
                
                <div className="warranty__modal-header">
                  <h3 className="warranty__modal-title">Chi tiết bảo hành sản phẩm</h3>
                </div>
                
                <div className="warranty__modal-body">
                  <div className="warranty__modal-product">
                    <div className="warranty__modal-image">
                      <img 
                        src={selectedItem.productInfo.mainImage || '/placeholder.png'} 
                        alt={selectedItem.productInfo.name} 
                        className="warranty__modal-img" 
                      />
                    </div>
                    
                    <div className="warranty__modal-info">
                      <h4 className="warranty__modal-name">{selectedItem.productInfo.name}</h4>
                      
                      <div className="warranty__modal-details">
                        <div className="warranty__modal-section">
                          <h5 className="warranty__modal-section-title">Thông tin sản phẩm</h5>
                          <p className="warranty__modal-detail">
                            <span className="warranty__modal-label">Thương hiệu:</span> 
                            <span className="warranty__modal-value">{getBrandName(selectedItem.productInfo.brand)}</span>
                          </p>
                          {selectedItem.productInfo.selectedColor && (
                            <p className="warranty__modal-detail">
                              <span className="warranty__modal-label">Màu sắc:</span> 
                              <span className="warranty__modal-value">{selectedItem.productInfo.selectedColor}</span>
                            </p>
                          )}
                          {selectedItem.productInfo.variant && Object.entries(selectedItem.productInfo.variant).filter(([key]) => key !== 'stock').map(([key, value]) => (
                            <p key={key} className="warranty__modal-detail">
                              <span className="warranty__modal-label">{key}:</span> 
                              <span className="warranty__modal-value">{value}</span>
                            </p>
                          ))}
                        </div>
                        
                        <div className="warranty__modal-section">
                          <h5 className="warranty__modal-section-title">Thông tin bảo hành</h5>
                          <p className="warranty__modal-detail">
                            <span className="warranty__modal-label">Mã đơn hàng:</span> 
                            <span className="warranty__modal-value">{selectedItem.orderInfo.orderCode}</span>
                          </p>
                          <p className="warranty__modal-detail">
                            <span className="warranty__modal-label">Ngày mua:</span> 
                            <span className="warranty__modal-value">{formatDate(selectedItem.warrantyInfo.startDate)}</span>
                          </p>
                          <p className="warranty__modal-detail">
                            <span className="warranty__modal-label">Hết hạn bảo hành:</span> 
                            <span className="warranty__modal-value">{formatDate(selectedItem.warrantyInfo.endDate)}</span>
                          </p>
                          <p className={`warranty__modal-detail warranty__modal-status ${
                            selectedItem.warrantyInfo.isActive ? "warranty__modal-status--active" : "warranty__modal-status--expired"
                          }`}>
                            <span className="warranty__modal-label">Trạng thái:</span> 
                            <span className="warranty__modal-value">
                              {selectedItem.warrantyInfo.status}
                              {selectedItem.warrantyInfo.isActive && ` (còn ${selectedItem.warrantyInfo.daysLeft} ngày)`}
                            </span>
                          </p>
                        </div>
                        
                        {selectedItem.customerInfo && (
                          <div className="warranty__modal-section">
                            <h5 className="warranty__modal-section-title">Thông tin khách hàng</h5>
                            <p className="warranty__modal-detail">
                              <span className="warranty__modal-label">Tên khách hàng:</span> 
                              <span className="warranty__modal-value">{selectedItem.customerInfo.name}</span>
                            </p>
                            <p className="warranty__modal-detail">
                              <span className="warranty__modal-label">Email:</span> 
                              <span className="warranty__modal-value">{selectedItem.customerInfo.email}</span>
                            </p>
                            <p className="warranty__modal-detail">
                              <span className="warranty__modal-label">Số điện thoại:</span> 
                              <span className="warranty__modal-value">{selectedItem.customerInfo.phone}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="warranty__modal-policy">
                    <h5 className="warranty__modal-policy-title">Chính sách bảo hành</h5>
                    <ul className="warranty__modal-policy-list">
                      <li className="warranty__modal-policy-item">Sản phẩm được bảo hành 12 tháng kể từ ngày mua hàng.</li>
                      <li className="warranty__modal-policy-item">Bảo hành miễn phí nếu sản phẩm gặp lỗi do nhà sản xuất.</li>
                      <li className="warranty__modal-policy-item">Không bảo hành cho các trường hợp hư hỏng do người dùng.</li>
                      <li className="warranty__modal-policy-item">Quý khách vui lòng mang theo hóa đơn khi đến bảo hành.</li>
                      <li className="warranty__modal-policy-item">Hotline hỗ trợ bảo hành: <strong>1800-1234</strong></li>
                    </ul>
                  </div>
                  
                  <div className="warranty__modal-actions">
                    <button 
                      className="warranty__modal-btn warranty__modal-btn--print" 
                      onClick={handlePrint}
                    >
                      In phiếu bảo hành
                    </button>
                    {selectedItem.warrantyInfo.isActive && (
                      <button className="warranty__modal-btn warranty__modal-btn--request">
                        Yêu cầu bảo hành
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default WarrantyCheck; 