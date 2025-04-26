import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import "./ProductDetail.css";

const API_BASE_URL = "http://localhost:5000/api";

const ProductDetail = () => {
    const { id } = useParams();
    console.log("Product ID:", id);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [message, setMessage] = useState("");
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/products/${id}`);
                setProduct(response.data);
                setMainImage(response.data.images[0]);
            } catch (err) {
                setError("Không tìm thấy sản phẩm!");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        if (!token) {
            setMessage("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/cart`,
                {
                    product_id: product._id.$oid || product._id,
                    quantity: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage("Sản phẩm đã được thêm vào giỏ hàng!");
        } catch (error) {
            setMessage(error.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!");
        }
    };

    if (loading) return <div className="text-center p-5">Đang tải sản phẩm...</div>;
    if (error) return <div className="text-center p-5 text-danger">{error}</div>;
    if (!product) return <div className="text-center p-5">Không tìm thấy sản phẩm</div>;

    return (
        <Container className="product-detail py-5">
            <Row>
                <Col md={6}>
                    <img
                        src={mainImage}
                        alt={product.title}
                        className="product-detail__main-image"
                    />
                    <div className="product-detail__thumbnails">
                        {product.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${product.title} - ${index}`}
                                className={`product-detail__thumbnail ${mainImage === img ? "product-detail__thumbnail--active" : ""}`}
                                onClick={() => setMainImage(img)}
                            />
                        ))}
                    </div>
                </Col>
                <Col md={6}>
                    <Card className="product-detail__info p-4 shadow">
                        <Card.Body>
                            <Card.Title>{product.title}</Card.Title>
                            <p>{product.description}</p>
                            <h4 className="text-danger">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(product.price)}
                            </h4>
                            {message && <Alert variant="success">{message}</Alert>}
                            <Button variant="danger" onClick={addToCart}>
                                Thêm vào giỏ hàng
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail;
