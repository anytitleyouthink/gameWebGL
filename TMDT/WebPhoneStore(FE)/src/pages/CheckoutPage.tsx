import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QrCode, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cartApi } from '../api/services';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const prefilledVoucher = (location.state as any)?.voucherCode || '';

  const [fullName, setFullName] = useState(user?.hoTen || user?.maKh || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.dienThoai || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.diaChi || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR'>('QR');
  const [voucherCode] = useState(prefilledVoucher);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto bg-white" style={{ maxWidth: '500px' }}>
          <h4>Yêu cầu đăng nhập</h4>
          <p className="text-muted small">Bạn cần đăng nhập tài khoản để thực hiện thủ tục đặt hàng.</p>
          <Link to="/login" state={{ from: '/checkout' }} className="btn btn-success rounded-pill px-4">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>Giỏ hàng của bạn đang trống!</h4>
        <Link to="/products" className="btn btn-outline-success rounded-pill px-4 mt-3">
          Chọn mua sản phẩm
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !address.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await cartApi.checkout({
        fullName,
        phoneNumber,
        email,
        address,
        note,
        paymentMethod,
        voucherCode: voucherCode || undefined,
      });

      if (res.success && res.data) {
        await refreshCart();
        if (paymentMethod === 'QR' && res.data.qrInfo) {
          navigate(`/payment-qr/${res.data.orderId}`, { state: { qrInfo: res.data.qrInfo } });
        } else {
          navigate('/orders/success', { state: { orderId: res.data.orderId, finalAmount: res.data.finalAmount } });
        }
      } else {
        setErrorMessage(res.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đã xảy ra lỗi kết nối khi đặt hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none text-muted">Giỏ hàng</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Thanh toán & Đặt hàng</li>
        </ol>
      </nav>

      <h3 className="fw-bold mb-4">Thông Tin Giao Hàng & Thanh Toán</h3>

      {errorMessage && (
        <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={(e) => e.stopPropagation()}>
        <div className="row g-4">
          {/* Cột thông tin nhận hàng */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">1. Địa chỉ nhận hàng</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Họ và tên người nhận *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Địa chỉ email nhận hóa đơn</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Địa chỉ giao hàng chi tiết *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Ghi chú giao hàng</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi đến..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cột phương thức thanh toán */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-3">2. Phương thức thanh toán</h5>

              <div className="d-flex flex-column gap-3">
                <label className={`border rounded-4 p-3 d-flex align-items-center cursor-pointer ${paymentMethod === 'QR' ? 'border-success bg-success-subtle' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="QR"
                    checked={paymentMethod === 'QR'}
                    onChange={() => setPaymentMethod('QR')}
                    className="form-check-input me-3"
                  />
                  <QrCode size={28} className="text-success me-3" />
                  <div>
                    <div className="fw-bold">Chuyển khoản trực tuyến qua VietQR (Khuyên dùng)</div>
                    <small className="text-muted">Quét mã QR bằng mọi app ngân hàng (MB, VCB, Techcombank, Momo...)</small>
                  </div>
                </label>

                <label className={`border rounded-4 p-3 d-flex align-items-center cursor-pointer ${paymentMethod === 'COD' ? 'border-success bg-success-subtle' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="form-check-input me-3"
                  />
                  <CreditCard size={28} className="text-primary me-3" />
                  <div>
                    <div className="fw-bold">Thanh toán khi nhận hàng (COD)</div>
                    <small className="text-muted">Kiểm tra hàng rồi thanh toán tiền mặt cho nhân viên giao vận</small>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cột tóm tắt giỏ hàng */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-sticky" style={{ top: '20px' }}>
              <h5 className="fw-bold mb-3">Đơn hàng của bạn ({cart.totalQuantity})</h5>

              <div className="list-group list-group-flush mb-3 max-h-300 overflow-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                    <div className="d-flex align-items-center">
                      <img
                        src={item.hinh?.startsWith('http') ? item.hinh : (item.hinh ? `/img/Hinh/${item.hinh}` : '/img/logo2.png')}
                        alt={item.tenHh || ''}
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        className="rounded me-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/img/logo2.png';
                        }}
                      />
                      <div>
                        <div className="small fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{item.tenHh}</div>
                        <small className="text-muted">{item.soLuong} x ${item.donGia}</small>
                      </div>
                    </div>
                    <span className="fw-bold small text-danger">${item.thanhTien}</span>
                  </div>
                ))}
              </div>

              <hr />

              <div className="d-flex justify-content-between py-1 small">
                <span className="text-muted">Tạm tính:</span>
                <span className="fw-semibold">${cart.totalPrice}</span>
              </div>
              {voucherCode && (
                <div className="d-flex justify-content-between py-1 small text-success">
                  <span>Mã giảm giá đã chọn:</span>
                  <span className="fw-bold">{voucherCode}</span>
                </div>
              )}
              <div className="d-flex justify-content-between py-1 small">
                <span className="text-muted">Vận chuyển:</span>
                <span className="text-success fw-semibold">Miễn phí</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-top mt-2">
                <span className="fw-bold fs-5">Tổng cộng:</span>
                <span className="fw-bold fs-4 text-danger">${cart.totalPrice}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-success btn-lg w-100 rounded-pill fw-bold mt-4 d-flex align-items-center justify-content-center"
              >
                {submitting ? (
                  <>Đang xác nhận đơn hàng...</>
                ) : (
                  <>
                    <CheckCircle2 size={20} className="me-2" /> Hoàn tất đặt hàng
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <Link to="/cart" className="text-muted text-decoration-none small">
                  <ArrowLeft size={14} className="me-1" /> Quay lại giỏ hàng
                </Link>
              </div>

              <div className="border-top mt-4 pt-3 text-center text-muted small">
                <ShieldCheck size={16} className="text-success me-1" /> Toàn bộ giao dịch được bảo mật và tính toán chuẩn xác bởi hệ thống Backend HDPE.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
