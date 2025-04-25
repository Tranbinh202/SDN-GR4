import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Alert, Modal, Badge } from "react-bootstrap";
import "./Order.css";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const token = localStorage.getItem("authToken");

  // 🔹 Hàm fetch đơn hàng từ API
  const fetchOrders = async () => {
    if (!token) {
      setError("Bạn cần đăng nhập để xem đơn hàng.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:9999/api/orders/customer", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải đơn hàng!");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Không thể tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gọi API khi component được mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xác nhận đơn hàng thành công
  const handleConfirmSuccess = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:9999/api/orders/${currentOrderId}/confirm-success`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi xác nhận đơn hàng.");
      }

      setActionMessage({ type: "success", text: "Xác nhận đơn hàng thành công!" });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === currentOrderId ? { ...order, status: "Đã hoàn thành" } : order
        )
      );
    } catch (error) {
      setActionMessage({ type: "danger", text: error.message });
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Hàm xử lý yêu cầu trả hàng/hoàn tiền
  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      setActionMessage({ type: "danger", text: "Vui lòng nhập lý do trả hàng." });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:9999/api/orders/${currentOrderId}/return`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: returnReason }),
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi gửi yêu cầu trả hàng.");
      }

      setActionMessage({ type: "success", text: "Yêu cầu trả hàng đã được gửi thành công!" });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === currentOrderId
            ? { ...order, returnRequest: { reason: returnReason, status: "Đang xử lý" } }
            : order
        )
      );
    } catch (error) {
      setActionMessage({ type: "danger", text: error.message });
    } finally {
      setActionLoading(false);
      setShowReturnModal(false);
    }
  };

  // Hàm mở modal chi tiết đơn hàng
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
  };

  // 🔹 Hiển thị loading trong khi chờ dữ liệu
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <h3>Đang tải đơn hàng...</h3>
      </Container>
    );
  }

  // 🔹 Hiển thị lỗi nếu có
  if (error) {
    return (
      <Container className="text-center p-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container style={{ minHeight: "40vh" }}>
      <h1 className="text-center">Đơn Hàng Của Bạn</h1>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.status}</td>
                <td>{order.totalAmount.toLocaleString()} VNĐ</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleViewDetail(order)}>
                    Xem chi tiết
                  </Button>
                  {order.status === "Đã giao" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="ms-2"
                        onClick={() => {
                          setCurrentOrderId(order._id);
                          setShowConfirmModal(true);
                        }}
                      >
                        Xác nhận
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="ms-2"
                        onClick={() => {
                          setCurrentOrderId(order._id);
                          setShowReturnModal(true);
                        }}
                      >
                        Trả hàng
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Không có đơn hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal xác nhận đơn hàng thành công */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xác nhận đơn hàng này đã hoàn thành?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={handleConfirmSuccess} disabled={actionLoading}>
            {actionLoading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal yêu cầu trả hàng */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Yêu cầu trả hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Nhập lý do trả hàng..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleReturnRequest} disabled={actionLoading}>
            {actionLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
