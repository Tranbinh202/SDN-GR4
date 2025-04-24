import React, { useState, useEffect } from "react";

import axios from "axios";
import {
  Rate,
  message,
  Pagination,
  List,
  Avatar,
  Progress,
  Modal,
  Button,
  Input,
  Tag,
} from "antd";
import "./Review_rv.css";
import moment from "moment";

const Review = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingStats, setRatingStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all"); // Trạng thái lọc
  const [selectedStars, setSelectedStars] = useState([]);
  const [filterByPurchase, setFilterByPurchase] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!productId) return;
  
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      fetchReviews();  // Người dùng đã đăng nhập
    } else {
      fetchPublicReviews();  // Người dùng khách
    }
  }, [productId, currentPage]);
  
  const fetchPublicReviews = () => {
    console.log("🔍 Gửi yêu cầu lấy đánh giá công khai với productId:", productId);
  
    axios
      .get(`http://localhost:9999/api/reviews/public/${productId}?page=${currentPage}&limit=5`)
      .then((res) => {
        console.log("📦 Kết quả API (Public):", res.data);
        setReviews(res.data.reviews);
        setTotalReviews(res.data.totalReviews);
        setAverageRating(res.data.averageRating);
        setRatingStats(res.data.ratingStats || {});
      })
      .catch((err) => console.error("❌ Lỗi khi tải đánh giá công khai:", err));
  };
  const fetchReviews = () => {
    const authToken = localStorage.getItem("authToken");
    console.log("🔍 Gửi yêu cầu lấy đánh giá có userReview với productId:", productId);
  
    axios
      .get(
        `http://localhost:9999/api/reviews/${productId}?page=${currentPage}&limit=5`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )
      .then((res) => {
        console.log("📦 Kết quả API (Có userReview):", res.data);
        setReviews(res.data.reviews);
        setTotalReviews(res.data.totalReviews);
        setAverageRating(res.data.averageRating);
        setRatingStats(res.data.ratingStats || {});
        setUserReview(res.data.userReview || null);
      })
      .catch((err) => console.error("❌ Lỗi khi tải đánh giá:", err));
  };
  

  const handleSubmit = async () => {
    if (!productId) {
      setError("Không xác định được sản phẩm.");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!authToken) {
      setError("Bạn cần đăng nhập để đánh giá.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:9999/api/reviews/${productId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newReview = {
        ...response.data,
        user: { name: userData?.name || "Người dùng ẩn danh" },
      };

      setReviews([newReview, ...reviews]);
      setTotalReviews(totalReviews + 1);
      setRating(0);
      setComment("");
      setError("");
      message.success("Đánh giá của bạn đã được gửi!");
      fetchReviews();
      setIsModalOpen(false); // Đóng popup sau khi gửi đánh giá
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi đánh giá.");
    }
  };

  const handleEdit = async () => {
    const authToken = localStorage.getItem("authToken");
    try {
      await axios.patch(
        `http://localhost:9999/api/reviews/${productId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      message.success("Đã cập nhật đánh giá thành công!");
      setIsModalOpen(false);
      fetchReviews(); // Tải lại toàn bộ đánh giá sau khi cập nhật
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật đánh giá.");
    }
  };

  const toggleStarFilter = (star) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const filterReviews = () => {
    return reviews.filter((rev) => {
      const matchPurchase = filterByPurchase ? rev.hasPurchased : true;
      const matchStars =
        selectedStars.length > 0 ? selectedStars.includes(rev.rating) : true;

      return matchPurchase && matchStars;
    });
  };

  const filteredReviews = filterReviews();

  const handleReviewButtonClick = () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      message.warning("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  return (
    <div className="review-container_rv">
      <h2 className="review-title_rv">Đánh giá & nhận xét</h2>

      <div className="review-summary_rv">
        <div className="average-score_rv">
          <h1>{averageRating.toFixed(1)}/5</h1>
          <Rate disabled value={averageRating} />
          <p>{totalReviews} đánh giá</p>
        </div>

        <div className="rating-breakdown_rv">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="rating-row_rv">
              <span>{star} ★</span>
              <Progress
                percent={(ratingStats[star] / totalReviews) * 100 || 0}
                showInfo={false}
                strokeColor="red"
              />
              <span>{ratingStats[star] || 0} đánh giá</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị review của người dùng nếu có */}
      {userReview && (
        <div className="user-review-section_rv">
          <h3>Đánh giá của bạn</h3>
          <List>
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{userReview.user?.name?.charAt(0) || 'A'}</Avatar>}
                title={
                  <span>
                    {userReview.user?.name || "Người dùng ẩn danh"}
                    {userReview.hasPurchased && (
                      <span className="purchased-tag_rv"> (Người dùng đã mua) </span>
                    )}
                  </span>
                }
                description={
                  <>
                    <Rate disabled value={userReview.rating} />
                    <p>{userReview.comment}</p>
                    <span className="review-date">
                      {moment(userReview.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </>
                }
              />
            </List.Item>
          </List>
        </div>
      )}

      {/* Nút đánh giá/chỉnh sửa */}
      <div className="review-button-container_rv">
        {userReview ? (
          <Button
            type="primary"
            className="edit-review-btn_rv"
            onClick={() => {
              setRating(userReview.rating);
              setComment(userReview.comment);
              setIsEditMode(true);
              setIsModalOpen(true);
            }}
            style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
          >
            Chỉnh sửa đánh giá
          </Button>
        ) : (
          <Button
            type="primary"
            className="review-now-btn_rv"
            onClick={handleReviewButtonClick}
          >
            Đánh giá ngay
          </Button>
        )}
      </div>

      <Modal
        title={isEditMode ? "Chỉnh sửa đánh giá" : "Đánh giá & nhận xét"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={isEditMode ? handleEdit : handleSubmit}
            disabled={rating === 0}
          >
            {isEditMode ? "Cập nhật" : "Gửi đánh giá"}
          </Button>,
        ]}
      >
        <div className="review-popup-content">
          <h3 className="review-heading_rv">Đánh giá chung</h3>

          <div
            className="rate-selection_rv"
            onMouseLeave={() =>
              setHoverRating(0)
            } /* Khi rời chuột, reset hover */
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`rate-item_rv ${
                  rating >= star ? "selected_rv" : ""
                }`}
                onMouseEnter={() =>
                  setHoverRating(star)
                } /* Khi di chuột vào, cập nhật trạng thái hover */
                onClick={() =>
                  setRating(star)
                } /* Khi click, giữ nguyên số sao */
              >
                <Rate
                  value={
                    hoverRating >= star || rating >= star ? 1 : 0
                  } /* Nếu hover hoặc đã chọn, thì sáng */
                  count={1}
                  disabled
                  className="rate-icon_rv"
                />
                <span className="rate-label_rv">
                  {star === 1
                    ? "Rất Tệ"
                    : star === 2
                    ? "Tệ"
                    : star === 3
                    ? "Bình thường"
                    : star === 4
                    ? "Tốt"
                    : "Tuyệt vời"}
                </span>
              </div>
            ))}
          </div>

          <Input.TextArea
            className="review-textarea-popup"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)"
          />
        </div>
      </Modal>

      <div className="review-filter_rv">
        {/* Hàng 1: Lọc theo trạng thái mua hàng */}
        <div className="filter-row_rv">
          <span className="filter-title_rv">Lọc theo</span>
          <Tag
            className={`filter-tag_rv ${!filterByPurchase ? "active_rv" : ""}`}
            onClick={() => setFilterByPurchase(false)}
          >
            Tất cả
          </Tag>
          <Tag
            className={`filter-tag_rv ${filterByPurchase ? "active_rv" : ""}`}
            onClick={() => setFilterByPurchase(!filterByPurchase)}
          >
            Đã mua hàng
          </Tag>
        </div>

        {/* Hàng 2: Lọc theo số sao (có thể chọn nhiều cái cùng lúc) */}
        <div className="filter-row_rv">
          {[5, 4, 3, 2, 1].map((star) => (
            <Tag
              key={star}
              className={`filter-tag_rv ${
                selectedStars.includes(star) ? "active_rv" : ""
              }`}
              onClick={() => toggleStarFilter(star)}
            >
              {star} <Rate disabled defaultValue={1} count={1} />
            </Tag>
          ))}
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <List
        itemLayout="horizontal"
        dataSource={filteredReviews}
        locale={{ emptyText: "Hiện tại không có đánh giá nào phù hợp" }}
        renderItem={(rev) => {
          const userName = rev.user?.name || "Người dùng ẩn danh";
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{userName.charAt(0)}</Avatar>}
                title={
                  <span>
                    {userName}
                    {rev.hasPurchased && (
                      <span className="purchased-tag_rv">
                        {" "}
                        (Người dùng đã mua){" "}
                      </span>
                    )}
                  </span>
                }
                description={
                  <>
                    <Rate disabled value={rev.rating} />
                    <p>{rev.comment}</p>
                    <span className="review-date">
                      {moment(rev.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </>
                }
              />
            </List.Item>
          );
        }}
      />

      {/* Phân trang */}
      <Pagination
        current={currentPage}
        total={totalReviews}
        pageSize={5}
        onChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default Review;
