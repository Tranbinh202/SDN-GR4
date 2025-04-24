import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';
import chatbotLogo from '../../assets/chatbot_logo.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là trợ lý AI của GearUp. Tôi có thể giúp gì cho bạn?', sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Danh sách câu hỏi gợi ý
  const suggestedQuestions = [
    "GearUp có những sản phẩm gì?",
    "Chính sách bảo hành như thế nào?",
    "Có ưu đãi cho sinh viên không?",
    "Địa chỉ cửa hàng ở đâu?",
    "Có bao nhiêu sản phẩm trong kho?",
    "Tìm sản phẩm iPhone",
    "Sản phẩm nào có giá từ 1000000 đến 5000000?",
    "Sản phẩm nào còn hàng?"
  ];

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message = inputMessage) => {
    if (message.trim() === '') return;

    const userMessage = { text: message, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:9999/api/gemini/chatbot', {
        message: message
      });

      setMessages(prevMessages => [
        ...prevMessages,
        { text: response.data.response, sender: 'bot' }
      ]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.', sender: 'bot' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button */}
      <div className="chatbot-toggle" onClick={toggleChatbot}>
        <img src={chatbotLogo} alt="Chat Bot" />
      </div>

      {/* Chatbot dialog */}
      {isOpen && (
        <div className="chatbot-dialog">
          <div className="chatbot-header">
            <h3>AI Assistant</h3>
            <button className="close-btn" onClick={toggleChatbot}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested Questions */}
          <div className="suggested-questions">
            <p>Câu hỏi gợi ý:</p>
            <div className="questions-container">
              {suggestedQuestions.map((question, index) => (
                <button 
                  key={index} 
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              onClick={() => sendMessage()} 
              disabled={isLoading || inputMessage.trim() === ''}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 