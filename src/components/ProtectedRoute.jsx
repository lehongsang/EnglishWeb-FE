import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

export default function ProtectedRoute({ children, adminOnly = false }) { // Thêm prop adminOnly
  const { isAuthenticated, isAdmin, loadingAuth, currentUserDb } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang kiểm tra xác thực..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated. Redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />; // Redirect về trang chủ (login)
  }

  // Nếu route yêu cầu quyền admin
  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: User is not admin. Redirecting to home.');
    antMessage.warning("Bạn không có quyền truy cập trang này.");
    return <Navigate to="/home" replace />; // Hoặc trang "Không có quyền truy cập"
  }

  // Nếu đã xác thực và có quyền (nếu cần), hiển thị children
  console.log('ProtectedRoute: User authenticated. Rendering children. DB User:', currentUserDb);
  return children;
}