import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Chưa đăng nhập -> Chuyển hướng về Login và lưu lại URL mong muốn
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Đã đăng nhập nhưng không có vai trò Admin
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto bg-white" style={{ maxWidth: '550px' }}>
          <div className="bg-danger-subtle text-danger d-inline-flex p-3 rounded-circle mb-3 mx-auto">
            <ShieldAlert size={40} />
          </div>
          <h4 className="fw-bold text-danger mb-2">Quyền Truy Cập Bị Từ Chối</h4>
          <p className="text-muted small mb-4">
            Tài khoản hiện tại (<strong>{user?.hoTen || user?.maKh}</strong>) không có quyền quản trị viên (Admin).
            Vui lòng đăng nhập bằng tài khoản Admin để truy cập trang này.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
              <ArrowLeft size={16} className="me-1" /> Về trang chủ
            </Link>
            <Link to="/login" className="btn btn-danger rounded-pill px-4">
              Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
