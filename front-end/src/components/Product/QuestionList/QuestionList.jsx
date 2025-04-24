import React, { useState, useEffect } from "react";
import { Avatar, Button, Input, List, message } from "antd";
import axios from "axios";
import moment from "moment";
import { SendOutlined } from "@ant-design/icons";
import "./QuestionList.css"; // File CSS riêng nếu cần

const API_BASE_URL = "http://localhost:9999/api"; // API backend

const QuestionList = ({ productId }) => {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")); // Lấy user từ localStorage
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions for productId:', productId);
      const response = await axios.get(`${API_BASE_URL}/question/${productId}`);
      console.log('API Response question:', response.data);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", error.response?.data || error.message);
    }
  };

  const handleSendQuestion = async () => {
    if (!authToken) {
      message.warning("Bạn cần đăng nhập để đặt câu hỏi!");
      return;
    }

    if (questionText.trim().length < 5) {
      message.warning("Câu hỏi phải có ít nhất 5 ký tự!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/question`,
        { productId, question: questionText },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      message.success("Câu hỏi đã được gửi! Đang chờ duyệt.");
      setQuestionText("");
      fetchQuestions(); // Cập nhật danh sách câu hỏi
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      message.error("Không thể gửi câu hỏi.");
    }
    setLoading(false);
  };

  return (
    <div className="question-container">
      <h3 className="question-title">Hỏi & đáp</h3>

      {/* Ô nhập câu hỏi */}
      <div className="question-input">
        <Avatar size={50} src={user?.image} />
        <Input.TextArea
          rows={3}
          placeholder="Nhập câu hỏi của bạn..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSendQuestion}
          className="question-send-btn"
        >
          Gửi
        </Button>
      </div>

      {/* Danh sách câu hỏi đã duyệt */}
      <List
        className="question-list"
        itemLayout="vertical"
        dataSource={questions}
        locale={{ emptyText: "Chưa có câu hỏi nào cho sản phẩm này." }}
        renderItem={(item) => (
          <List.Item key={item._id} className="question-item">
            {/* Hiển thị câu hỏi từ User */}
            <List.Item.Meta
              avatar={<Avatar>{item.user.name.charAt(0)}</Avatar>}
              title={
                <span className="question-user">
                  {item.user.name} <span className="question-time">{moment(item.createdAt).fromNow()}</span>
                </span>
              }
              description={<p className="question-text">{item.question}</p>}
            />

            {/* Nếu có câu trả lời từ Sale */}
            {item.answers.length > 0 &&
              item.answers.map((answer) => (
                <div key={answer._id} className="question-answer">
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: "red", color: "white" }}>QTV</Avatar>}
                    title={
                      <span className="answer-admin">
                        Quản trị viên <span className="question-time">{moment(answer.createdAt).fromNow()}</span>
                      </span>
                    }
                    description={<p className="answer-text">{answer.answer}</p>}
                  />
                </div>
              ))}
          </List.Item>
        )}
      />
    </div>
  );
};

export default QuestionList;
