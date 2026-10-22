import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cartApi } from '../api/services';
import { VoucherDto } from '../types';

export const CartPage: React.FC = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    cartApi.getAvailableVouchers().then((res) => {
      if (res.success && res.data) {
        setVouchers(res.data);
      }
    });
  }, []);

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = codeToApply || voucherCode;
    if (!code.trim()) return;

    setApplying(true);
    setVoucherMessage(null);

    try {
      const res = await cartApi.applyVoucher(code.trim());
      if (res.success && res.data) {
        setDiscountAmount(res.data.discountAmount);
        setVoucherMessage({ text: res.data.message, success: true });
        setVoucherCode(code.trim());
      } else {
        setDiscountAmount(0);
        setVoucherMessage({ text: res.message || 'Mã không khả dụng', success: false });
      }
    } catch (err: any) {
      setDiscountAmount(0);
      setVoucherMessage({
        text: err.response?.data?.message || 'Lỗi khi áp dụng mã voucher.',
        success: false,
      });
    } finally {
      setApplying(false);
    }
  };

  const finalTotal = Math.max(0, (cart?.totalPrice ?? 0) - discountAmount);

  if (loading && !cart) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-5 text-center bg-white rounded-4 shadow-sm my-5 p-5">
        <ShoppingBag size={64} className="text-muted mb-3" />
        <h4 className="fw-bold">Giỏ hàng của bạn đang trống!</h4>
        <p className="text-muted small">Hãy quay lại cửa hàng để chọn những món đồ công nghệ tuyệt vời.</p>
        <Link to="/products" className="btn btn-success rounded-pill px-4 mt-2">
          <ArrowLeft size={16} className="me-2" /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Giỏ Hàng Của Bạn ({cart.totalQuantity} sản phẩm)</h3>

      <div className="row g-4">
        {/* Bảng sản phẩm */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">Sản phẩm</th>
                    <th scope="col" className="text-center">Đơn giá</th>
                    <th scope="col" className="text-center">Số lượng</th>
                    <th scope="col" className="text-end pe-4">Thành tiền</th>
                    <th scope="col" className="text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <img
                            src={item.hinh?.startsWith('http') ? item.hinh : (item.hinh ? `/img/Hinh/${item.hinh}` : '/img/logo2.png')}
                            alt={item.tenHh || ''}
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            className="rounded-3 me-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/img/logo2.png';
                            }}
                          />
                          <div>
                            <Link to={`/products/${item.maHh}`} className="text-dark fw-semibold text-decoration-none small">
                              {item.tenHh}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="text-center fw-medium">${item.donGia}</td>
                      <td className="text-center">
                        <div className="input-group input-group-sm mx-auto" style={{ width: '100px' }}>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.maHh, -1)}
                          >
                            -
                          </button>
                          <span className="form-control text-center bg-white">{item.soLuong}</span>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.maHh, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-end pe-4 fw-bold text-danger">${item.thanhTien}</td>
                      <td className="text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="btn btn-link text-danger p-0"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <Link to="/products" className="btn btn-outline-secondary rounded-pill px-4 btn-sm">
              <ArrowLeft size={16} className="me-2" /> Tiếp tục chọn hàng
            </Link>
          </div>
        </div>

        {/* Tóm tắt thanh toán & Voucher */}
        <div className="col-lg-4">
          {/* Card nhập Voucher */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <Tag size={18} className="text-success me-2" /> Mã giảm giá (Voucher)
            </h6>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              />
              <button
                className="btn btn-success"
                onClick={() => handleApplyVoucher()}
                disabled={applying || !voucherCode.trim()}
              >
                {applying ? 'Kiểm tra...' : 'Áp dụng'}
              </button>
            </div>

            {voucherMessage && (
              <div className={`alert ${voucherMessage.success ? 'alert-success' : 'alert-danger'} py-2 px-3 small mt-2 mb-0`}>
                {voucherMessage.text}
              </div>
            )}

            {/* Danh sách voucher gợi ý */}
            {vouchers.length > 0 && (
              <div className="mt-3 border-top pt-3">
                <small className="text-muted fw-bold d-block mb-2">Mã khả dụng trong hệ thống:</small>
                <div className="d-flex flex-column gap-2">
                  {vouchers.map((v) => (
                    <div key={v.code} className="border rounded-3 p-2 bg-light d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success me-2">{v.code}</span>
                        <small className="text-muted d-block mt-1">{v.description}</small>
                      </div>
                      <button
                        onClick={() => handleApplyVoucher(v.code)}
                        className="btn btn-sm btn-outline-success rounded-pill px-2 py-0"
                        style={{ fontSize: '12px' }}
                      >
                        Chọn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Tổng tiền */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-bold mb-3">Tóm tắt đơn hàng</h6>
            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Tạm tính giỏ hàng:</span>
              <span className="fw-semibold">${cart.totalPrice}</span>
            </div>
            {discountAmount > 0 && (
              <div className="d-flex justify-content-between py-2 border-bottom small text-success">
                <span>Giảm giá ({voucherCode}):</span>
                <span className="fw-bold">-${discountAmount}</span>
              </div>
            )}
            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Phí vận chuyển:</span>
              <span className="text-success fw-semibold">Miễn phí</span>
            </div>
            <div className="d-flex justify-content-between py-3 mb-3">
              <span className="fw-bold fs-5">Tổng thanh toán:</span>
              <span className="fw-bold fs-4 text-danger">${finalTotal}</span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { voucherCode: discountAmount > 0 ? voucherCode : undefined } })}
              className="btn btn-success btn-lg w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center"
            >
              Tiến hành đặt hàng <ArrowRight size={18} className="ms-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
