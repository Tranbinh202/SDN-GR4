import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "./Cart.css";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    // 🔹 Hàm fetch giỏ hàng từ API
    const fetchCart = () => {
        if (!token) {
            setError("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }

        fetch("http://localhost:9999/api/cart", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((data) => {
            setCart(data.items || []);
            setLoading(false);
        })
        .catch(() => {
            setError("Không thể tải giỏ hàng!");
            setLoading(false);
        });
    };

    // 🔹 Gọi API khi component mount hoặc cart thay đổi
    useEffect(() => {
        fetchCart();
    }, []);

    // 🔹 Cập nhật số lượng sản phẩm
    const updateQuantity = (productId, newQuantity, currentStock) => {
        if (newQuantity < 1) return;
        
        fetch("http://localhost:9999/api/cart", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message.includes("vượt quá số lượng")) {
                alert(`Chỉ còn ${data.availableStock} sản phẩm trong kho!`);
            }
            fetchCart(); // Refresh giỏ hàng
        })
        .catch(() => alert("Cập nhật số lượng thất bại!"));
    };

    // 🔹 Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (productId, itemId) => {
        fetch("http://localhost:9999/api/cart", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ product_id: productId, item_id: itemId }),
        })
        .then((res) => res.json())
        .then(() => {
            fetchCart(); // ✅ Gọi lại API để cập nhật giỏ hàng sau khi xóa
        })
        .catch(() => alert("Xóa sản phẩm thất bại!"));
    };

    if (loading) return <h3 className="text-center">Đang tải giỏ hàng...</h3>;
    if (error) return <h3 className="text-center text-danger">{error}</h3>;

    return (
        <Container style={{ minHeight: '40vh' }}>
            <h1 className="text-center">Giỏ Hàng Của Bạn</h1>
            <Row className="my-3">
                <Col xs={12} md={8}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Sản phẩm</th>
                                <th>Màu sắc</th>
                                <th>Thông tin</th>
                                <th>Giá</th>
                                <th>Ảnh</th>
                                <th>Số lượng</th>
                                <th>Tổng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length > 0 ? (
                                cart.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name} ({item.brand})</td>
                                        <td>{item.color}</td>
                                        <td>
                                            {item.variant.storage && `Dung lượng: ${item.variant.storage}`} 
                                            {item.variant.length && `Chiều dài: ${item.variant.length}`} 
                                            {item.variant.material && `Chất liệu: ${item.variant.material}`} 
                                            {item.variant.charger && `Loại sạc: ${item.variant.charger}`}
                                        </td>
                                        <td>{item.price.toLocaleString()} VNĐ</td>
                                        <td>
                                            <img src={item.image} alt={item.name} style={{ width: '50px' }} />
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center" style={{ width: '100px' }}>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </Button>
                                                <span className="mx-auto">{item.quantity}</span>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            {item.variant && item.variant.stock && (
                                                <small className="text-muted">
                                                    Còn {item.variant.stock} sản phẩm trong kho
                                                </small>
                                            )}
                                        </td>
                                        <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                        <td>
                                            <Button variant="danger" onClick={() => removeFromCart(item.product_id, item._id)}>Xóa</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">Giỏ hàng trống</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
                <Col xs={12} md={4}>
                    <div className="cart__summary">
                        <h4 className="cart__summary-title">THÔNG TIN ĐƠN HÀNG</h4>
                        <div className="cart__summary-details">
                            <h3 className="cart__summary-total">
                                Tổng đơn hàng: {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} VNĐ
                            </h3>
                        </div>
                        <Button className="cart__checkout-button" onClick={() => navigate('/checkout')}>
                            THANH TOÁN
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
