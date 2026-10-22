import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, QrCode, ArrowRight, Copy, Check } from 'lucide-react';
import { cartApi } from '../api/services';
import { PaymentQRResponse } from '../types';

export const PaymentQRPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const initialQr = (location.state as any)?.qrInfo as PaymentQRResponse | undefined;

  const [qrInfo, setQrInfo] = useState<PaymentQRResponse | null>(initialQr || null);
  const [loading, setLoading] = useState(!initialQr);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!qrInfo && orderId) {
      setLoading(true);
      cartApi.getPaymentQr(parseInt(orderId))
        .then((res) => {
          if (res.success && res.data) {
            setQrInfo(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, qrInfo]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Đang sinh mã VietQR thanh toán...</p>
      </div>
    );
  }

  if (!qrInfo) {
    return (
      <div className="container py-5 text-center">
        <h4>Không tìm thấy thông tin thanh toán!</h4>
        <Link to="/orders/history" className="btn btn-success mt-3 rounded-pill px-4">
          Xem lịch sử đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '680px' }}>
        <div className="text-center mb-4">
          <div className="bg-success-subtle text-success d-inline-flex p-3 rounded-circle mb-3">
            <CheckCircle size={40} />
          </div>
          <h3 className="fw-bold">Đặt Hàng Thành Công!</h3>
          <p className="text-muted small">
            Đơn hàng <strong>#{qrInfo.maHd}</strong> của bạn đã được ghi nhận. Vui lòng quét mã QR bên dưới để hoàn tất chuyển khoản.
          </p>
        </div>

        {/* Khung VietQR */}
        <div className="bg-light p-4 rounded-4 text-center border mb-4">
          <div className="bg-white p-3 rounded-3 shadow-sm d-inline-block mb-3">
            <img
              src={qrInfo.qrCodeUrl}
              alt="Mã VietQR"
              className="img-fluid"
              style={{ maxWidth: '280px', height: 'auto' }}
            />
          </div>
          <p className="small text-muted mb-0">Mở app Ngân hàng / Ví điện tử và chọn <strong>Quét mã QR</strong></p>
        </div>

        {/* Thông tin chuyển khoản chi tiết */}
        <div className="list-group list-group-flush mb-4 small">
          <div className="list-group-item d-flex justify-content-between px-0">
            <span className="text-muted">Ngân hàng thụ hưởng:</span>
            <span className="fw-bold">{qrInfo.bankId} (MB Bank)</span>
          </div>
          <div className="list-group-item d-flex justify-content-between px-0">
            <span className="text-muted">Số tài khoản:</span>
            <span className="fw-bold text-success d-flex align-items-center">
              {qrInfo.accountNo}
              <button
                onClick={() => copyToClipboard(qrInfo.accountNo)}
                className="btn btn-link btn-sm p-0 ms-2 text-decoration-none"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </span>
          </div>
          <div className="list-group-item d-flex justify-content-between px-0">
            <span className="text-muted">Tên chủ tài khoản:</span>
            <span className="fw-bold">{qrInfo.accountName}</span>
          </div>
          <div className="list-group-item d-flex justify-content-between px-0">
            <span className="text-muted">Số tiền quy đổi (VND):</span>
            <span className="fw-bold fs-5 text-danger">{qrInfo.soTienQuyDoi.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="list-group-item d-flex justify-content-between px-0">
            <span className="text-muted">Nội dung chuyển khoản:</span>
            <span className="fw-bold bg-warning-subtle px-2 py-1 rounded">{qrInfo.noiDungChuyenKhoan}</span>
          </div>
        </div>

        <div className="d-grid gap-2">
          <Link to="/orders/history" className="btn btn-success rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center">
            Kiểm tra tiến độ đơn hàng <ArrowRight size={18} className="ms-2" />
          </Link>
          <Link to="/" className="btn btn-outline-secondary rounded-pill py-2">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
