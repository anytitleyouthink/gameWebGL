import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Eye, ShoppingBag } from 'lucide-react';
import { orderApi } from '../api/services';
import { HoaDonDto } from '../types';
import { useAuth } from '../context/AuthContext';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<HoaDonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    orderApi.getOrderHistory()
      .then((res) => {
        if (res.success && res.data) {
          setOrders(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <h4>Vui lòng đăng nhập</h4>
        <p className="text-muted small">Bạn cần đăng nhập tài khoản để tra cứu lịch sử mua hàng.</p>
        <Link to="/login" className="btn btn-success rounded-pill px-4">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Lịch sử đơn hàng</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0 d-flex align-items-center">
          <Clock size={24} className="text-success me-2" /> Lịch Sử Mua Hàng
        </h3>
        <Link to="/products" className="btn btn-outline-success btn-sm rounded-pill px-3">
          <ShoppingBag size={14} className="me-1" /> Mua thêm sản phẩm
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-2 text-muted">Đang tải lịch sử đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm p-5">
          <Package size={56} className="text-muted mb-3" />
          <h5>Bạn chưa có đơn hàng nào!</h5>
          <p className="text-muted small">Hãy chọn những thiết bị yêu thích và đặt hàng ngay hôm nay.</p>
          <Link to="/products" className="btn btn-success rounded-pill px-4 mt-2">
            Khám phá kho hàng
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order.maHd} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <span className="badge bg-success-subtle text-success me-2">Mã đơn: #{order.maHd}</span>
                  <span className="text-muted small">
                    Ngày đặt: {new Date(order.ngayDat).toLocaleDateString('vi-VN')} {new Date(order.ngayDat).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                  <span className="badge bg-primary-subtle text-primary">
                    {order.tenTrangThai || (order.maTrangThai === 0 ? 'Mới đặt hàng' : 'Đang xử lý')}
                  </span>
                  <span className="badge bg-warning-subtle text-dark">
                    {order.cachThanhToan}
                  </span>
                </div>
              </div>

              {/* Danh sách sản phẩm của đơn */}
              <div className="list-group list-group-flush mb-3">
                {order.chiTietHds.map((ct) => (
                  <div key={ct.maCt} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                    <div className="d-flex align-items-center">
                      <img
                        src={ct.hinh ? `/img/Hinh/${ct.hinh}` : '/img/logo2.png'}
                        alt={ct.tenHh}
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        className="rounded me-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/img/logo2.png';
                        }}
                      />
                      <div>
                        <div className="fw-semibold small">{ct.tenHh}</div>
                        <small className="text-muted">{ct.soLuong} x ${ct.donGia}</small>
                      </div>
                    </div>
                    <span className="fw-bold small text-danger">${ct.thanhTien}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center border-top pt-3">
                <div className="small text-muted">
                  Người nhận: <strong>{order.hoTen}</strong> | Đ/C: <strong>{order.diaChi}</strong>
                </div>
                <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
                  <span className="small text-muted">Tổng tiền:</span>
                  <span className="fs-5 fw-bold text-danger">${order.tongTien}</span>
                  <Link to={`/orders/${order.maHd}`} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    <Eye size={14} className="me-1" /> Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
