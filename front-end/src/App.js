import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "./pages/Home/HomePage";
import ProductDetail from "./pages/Product/Detail";
import LoginPage from "./pages/Form/LoginPage";
import RegisterPage from "./pages/Form/RegisterPage";
import ForgotPasswordPage from "./pages/Form/ForgotPasswordPage";
import ResetPassword from "./components/Form/ResetPassword";
import VerifyEmail from "./components/Form/VerifyEmail";

import AccountLayout from "./components/Profile/AccountLayout";
import ProfilePage from "./pages/Profile/ProfilePage";
import OrderHistoryPage from "./pages/Profile/OrderHistoryPage";
import ChangePasswordPage from "./pages/Form/ChangePasswordPage";
import EditProfilePage from "./pages/Profile/EditProfilePage";
import ContactPage from "./pages/Home/ContactPage";
import FavoritesPage from "./pages/Product/FavoritesPage";
import VerifyOrder from "./pages/Cart/VerifyOrder";
import OrderPage from "./pages/OrderPage";
import CartPage from "./pages/Cart/CartPage";

import ProductListByCategory from "./pages/ProductsbyCategory/ProducsList";

import PaymentSuccess from "./components/Cart/PaymentSuccess";
import PaymentCancel from "./components/Cart/PaymentCancel";

import Manager from "./pages/Manager/Manager";
import ManageProduct from "./components/Sales/MangerProduct";
import AdminPage from "./components/AdminPage"; 
import ProtectedRoute from "./components/ProtectedRoute";
import SalePage from "./pages/SalePage/SalePage";
import AuthRedirect from "./components/Form/AuthRedirect";
import OrderProcessing from './components/Order/OrderProcessing';
import ShipperPage from "./pages/ShipperPage/ShipperPage";
import ManagerDashboard from "./pages/Manager/ManagerDashbroad";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Chatbot from "./components/Chatbot/Chatbot"; // Import Chatbot component
import News from './pages/News/News';
import NewsDetail from './pages/News/NewsDetail';
import RoleRouteGuard from "./components/RoleRouteGuard";
import NotificationPage from "./pages/Notification/NotificationPage";
import ChatProvider from "./components/ChatProvider";
import WarrantyCheck from './components/Warranty/WarrantyCheck';

const App = () => {
  return (
    <Router>
      <GoogleOAuthProvider clientId="786381256762-26ds2r2qbeus4ekb31nmsf3ji52hosj2.apps.googleusercontent.com">
        <RoleRouteGuard>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route
              path="/login"
              element={
                <AuthRedirect>
                  <LoginPage />
                </AuthRedirect>
              }
            />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/register"
              element={
                <AuthRedirect>
                  <RegisterPage />
                </AuthRedirect>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthRedirect>
                  <ForgotPasswordPage />
                </AuthRedirect>
              }
            />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/verify-order" element={<VerifyOrder />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            {/* Route danh mục sản phẩm */}
            <Route
              path="/products/category/:id"
              element={<ProductListByCategory />}
            />
            <Route
              path="/products/category/:id/sub/:sub"
              element={<ProductListByCategory />}
            />

            {/* Route thanh toán */}
            <Route path="/checkout" element={<VerifyOrder />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/cancel" element={<PaymentCancel />} />

            {/* Manager Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Sale Route */}
            <Route
              path="/sale"
              element={
                <ProtectedRoute allowedRoles={["sale", "admin"]}>
                  <SalePage />
                </ProtectedRoute>
              }
            />

            {/* Shipper Route */}
            <Route
              path="/shipper"
              element={
                <ProtectedRoute allowedRoles={["shipper", "admin"]}>
                  <ShipperPage />
                </ProtectedRoute>
              }
            />

            {/* Account Routes */}
            <Route path="/account" element={<AccountLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<EditProfilePage />} />
              <Route path="order-history" element={<OrderHistoryPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
            </Route>

            <Route path="/contact" element={<ContactPage />} />

            <Route path="/order-processing" element={<OrderProcessing />} />

            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />

            <Route path="/warranty" element={<WarrantyCheck />} />
          </Routes>
        
         
          <ChatProvider />

        </RoleRouteGuard>
      </GoogleOAuthProvider>

    </Router>
  );
};

export default App;


