import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, FileText } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { orderId?: number; finalAmount?: number } | undefined;

  if (!state?.orderId) {
    return <Navigate to="/orders/history" replace />;
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mx-auto bg-white text-center" style={{ maxWidth: '600px' }}>
        <div className="bg-success-subtle text-success d-inline-flex p-3 rounded-circle mb-3 mx-auto">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="fw-bold mb-2">Đặt Hàng Thành Công!</h3>
        <p className="text-muted mb-4">
          Cảm ơn bạn đã tin tưởng mua sắm tại <strong>HDPE Phone Store</strong>.<br />
          Mã đơn hàng của bạn là <strong className="text-success">#{state.orderId}</strong>
        </p>

        {state.finalAmount !== undefined && (
          <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center">
            <span className="text-muted">Tổng giá trị thanh toán:</span>
            <span className="fw-bold fs-5 text-danger">${state.finalAmount}</span>
          </div>
        )}

        <div className="d-grid gap-2">
          <Link to={`/orders/${state.orderId}`} className="btn btn-success rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center">
            <FileText size={18} className="me-2" /> Xem chi tiết đơn hàng
          </Link>
          <Link to="/products" className="btn btn-outline-secondary rounded-pill py-2 d-flex align-items-center justify-content-center">
            <ShoppingBag size={18} className="me-2" /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};
