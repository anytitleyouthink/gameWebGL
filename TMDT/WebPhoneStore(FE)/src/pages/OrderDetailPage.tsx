import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, FileText } from 'lucide-react';
import { orderApi } from '../api/services';
import { HoaDonDto } from '../types';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<HoaDonDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderApi.getOrderDetails(parseInt(id))
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h4>Không tìm thấy thông tin đơn hàng #{id}</h4>
        <Link to="/orders/history" className="btn btn-success rounded-pill px-4 mt-3">
          <ArrowLeft size={16} className="me-2" /> Quay lại lịch sử
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
          <li className="breadcrumb-item"><Link to="/orders/history" className="text-decoration-none text-muted">Lịch sử</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Chi tiết đơn #{order.maHd}</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Chi Tiết Đơn Hàng #{order.maHd}</h3>
        <Link to="/orders/history" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <ArrowLeft size={14} className="me-1" /> Danh sách đơn
        </Link>
      </div>

      <div className="row g-4">
        {/* Cột sản phẩm */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <Package size={20} className="text-success me-2" /> Danh sách sản phẩm mua
            </h5>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Sản phẩm</th>
                    <th scope="col" className="text-center">Đơn giá</th>
                    <th scope="col" className="text-center">Số lượng</th>
                    <th scope="col" className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.chiTietHds.map((ct) => (
                    <tr key={ct.maCt}>
                      <td>
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
                          <span className="fw-semibold small">{ct.tenHh}</span>
                        </div>
                      </td>
                      <td className="text-center">${ct.donGia}</td>
                      <td className="text-center">{ct.soLuong}</td>
                      <td className="text-end fw-bold text-danger">${ct.thanhTien}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">Tổng thanh toán:</td>
                    <td className="text-end fw-bold fs-5 text-danger">${order.tongTien}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Cột thông tin người nhận */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
            <h6 className="fw-bold mb-3">Thông tin giao nhận</h6>
            <div className="d-flex flex-column gap-2 small">
              <div><User size={16} className="text-muted me-2" /> Người nhận: <strong>{order.hoTen}</strong></div>
              <div><MapPin size={16} className="text-muted me-2" /> Địa chỉ: <strong>{order.diaChi}</strong></div>
              <div><Clock size={16} className="text-muted me-2" /> Ngày đặt: <strong>{new Date(order.ngayDat).toLocaleString('vi-VN')}</strong></div>
              <div><CreditCard size={16} className="text-muted me-2" /> Phương thức: <strong>{order.cachThanhToan}</strong></div>
              <div><FileText size={16} className="text-muted me-2" /> Ghi chú: <em>{order.ghiChu || 'Không có'}</em></div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-bold mb-3">Trạng thái xử lý</h6>
            <span className="badge bg-success fs-6 py-2">
              {order.tenTrangThai || (order.maTrangThai === 0 ? 'Đã tiếp nhận đơn hàng' : 'Đang vận chuyển')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
