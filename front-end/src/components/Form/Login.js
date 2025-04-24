import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import "./AuthForm.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Hàm xử lý điều hướng dựa trên role
  const handleNavigation = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "manager") {
      navigate("/manager");
    } else if (role === "sale") {
      navigate("/sale");
    } else if (role === "shipper") {
      navigate("/shipper");
    } else {
      navigate("/");
    }
  };

  // Xử lý đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:9999/api/users/login", { email, password });
      const { token, user } = response.data;

      if (!user.isVerified) {
        setError("Tài khoản chưa được xác minh. Vui lòng kiểm tra email.");
        return;
      }

      if (user.isBanned) {
        setError("Tài khoản của bạn đã bị block. Vui lòng liên hệ admin để được hỗ trợ.");
        return;
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      // Kích hoạt sự kiện cập nhật UI ngay lập tức
      window.dispatchEvent(new Event("userUpdate"));
      setSuccessMessage(`Chào mừng, ${user.name}!`);

      const role = user.role?.role?.toLowerCase() || "customer";
      setTimeout(() => handleNavigation(role), 1000);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:9999/api/users/google-login", {
        idToken: credentialResponse.credential
      });

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      // Kích hoạt sự kiện cập nhật UI ngay lập tức
      window.dispatchEvent(new Event("userUpdate"));
      setSuccessMessage(`Chào mừng, ${user.name}!`);

      const role = user.role?.role?.toLowerCase() || "customer";

      setTimeout(() => handleNavigation(role), 1000);
    } catch (error) {
      console.error("Google Login Error:", error);
      setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="auth-container">
      <h2>ĐĂNG NHẬP</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <button type="submit" className="auth-button">Đăng nhập</button>

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
            }}
            useOneTap
          />
        </div>

        <div className="auth-links">
          <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu?</Link>
          <span> | </span>
          <Link to="/register" className="register-link">Đăng ký ngay</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;