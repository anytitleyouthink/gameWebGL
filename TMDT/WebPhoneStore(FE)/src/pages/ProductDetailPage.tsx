import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Eye, ArrowLeft, Check } from 'lucide-react';
import { productApi } from '../api/services';
import { HangHoaDto } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<HangHoaDto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { showCartSuccess, showError } = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProductDetails(parseInt(id));
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error('Lỗi chi tiết sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const ok = await addToCart(product.maHh, quantity);
    if (ok) {
      setAdded(true);
      showCartSuccess(product.tenHh, quantity, product.hinh);
      setTimeout(() => setAdded(false), 2500);
    } else {
      showError('Thêm vào giỏ hàng', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4>Không tìm thấy sản phẩm!</h4>
        <Link to="/products" className="btn btn-success mt-3 rounded-pill px-4">
          <ArrowLeft size={16} className="me-2" /> Quay lại danh sách
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
          <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-muted">Sản phẩm</Link></li>
          <li className="breadcrumb-item"><Link to={`/products?loai=${product.maLoai}`} className="text-decoration-none text-muted">{product.tenLoai}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.tenHh}</li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-4 mb-4 bg-white">
        <div className="row g-5">
          {/* Ảnh sản phẩm */}
          <div className="col-lg-5 text-center">
            <div className="p-4 bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ minHeight: '360px' }}>
              <img
                src={product.hinh?.startsWith('http') ? product.hinh : (product.hinh ? `/img/Hinh/${product.hinh}` : '/img/logo2.png')}
                alt={product.tenHh}
                className="img-fluid rounded-3"
                style={{ maxHeight: '320px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/logo2.png';
                }}
              />
            </div>
            <div className="d-flex justify-content-center align-items-center mt-3 text-muted small">
              <Eye size={16} className="me-1" />
              <span>Đã có <strong>{product.soLanXem}</strong> lượt xem</span>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="col-lg-7">
            <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill mb-2 fw-semibold">
              {product.tenLoai || 'Sản phẩm công nghệ'}
            </span>
            <h2 className="fw-bold mb-3">{product.tenHh}</h2>

            <div className="mb-3 d-flex align-items-baseline gap-3">
              <span className="text-danger fw-bold display-6">${product.donGia ?? 0}</span>
              {product.giamGia > 0 && (
                <span className="badge bg-danger rounded-pill">
                  Giảm {Math.round(product.giamGia * 100)}%
                </span>
              )}
            </div>

            <div className="p-3 bg-light rounded-3 mb-4 small text-muted">
              <div><strong>Nhà cung cấp:</strong> {product.tenNcc || product.maNcc}</div>
              <div><strong>Quy cách đóng gói:</strong> {product.moTaDonVi || 'Bộ tiêu chuẩn'}</div>
              <div><strong>Ngày sản xuất:</strong> {new Date(product.ngaySx).toLocaleDateString('vi-VN')}</div>
            </div>

            {/* Bộ chọn số lượng và nút mua */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="input-group" style={{ width: '130px' }}>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-control text-center fw-bold"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`btn btn-lg rounded-pill px-4 d-flex align-items-center ${
                  added ? 'btn-success' : 'btn-success'
                }`}
              >
                {added ? (
                  <>
                    <Check size={20} className="me-2" /> Đã thêm vào giỏ!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="me-2" /> Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>

            {/* Cam kết dịch vụ */}
            <div className="row g-2 border-top pt-4">
              <div className="col-sm-4">
                <div className="d-flex align-items-center small text-muted">
                  <Truck size={18} className="text-success me-2" /> Giao hàng toàn quốc
                </div>
              </div>
              <div className="col-sm-4">
                <div className="d-flex align-items-center small text-muted">
                  <ShieldCheck size={18} className="text-success me-2" /> Bảo hành 12 tháng
                </div>
              </div>
              <div className="col-sm-4">
                <div className="d-flex align-items-center small text-muted">
                  <RotateCcw size={18} className="text-success me-2" /> 7 ngày đổi trả
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab mô tả chi tiết */}
        <div className="mt-5 border-top pt-4">
          <h5 className="fw-bold mb-3">Mô Tả Sản Phẩm Chi Tiết</h5>
          <div className="text-muted leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
            {product.moTa || 'Thông tin mô tả đang được đội ngũ kỹ thuật cập nhật.'}
          </div>
        </div>
      </div>
    </div>
  );
};
