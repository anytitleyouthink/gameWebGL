import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, Headphones, Tag } from 'lucide-react';
import { productApi } from '../api/services';
import { HangHoaDto, MenuLoaiVM } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<HangHoaDto[]>([]);
  const [categories, setCategories] = useState<MenuLoaiVM[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showCartSuccess, showError } = useToast();
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getHomeProducts(),
          productApi.getCategories(),
        ]);
        if (prodRes.success && prodRes.data) {
          setFeaturedProducts(prodRes.data.slice(0, 8));
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = async (id: number) => {
    setAddingId(id);
    const prod = featuredProducts.find((p) => p.maHh === id);
    const ok = await addToCart(id, 1);
    if (ok) {
      showCartSuccess(prod?.tenHh || 'Sản phẩm', 1, prod?.hinh);
    } else {
      showError('Thêm vào giỏ hàng', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
    }
    setAddingId(null);
  };

  return (
    <div className="home-page">
      {/* Hero Banner Carousel Section */}
      <section className="hero-banner bg-success text-white py-5 position-relative overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #198754 0%, #0d5c36 100%)' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                <Tag size={14} className="me-1" /> Ưu Đãi Đặc Biệt Mùa Mua Sắm
              </span>
              <h1 className="display-4 fw-bold mb-3">Công Nghệ Đỉnh Cao<br />Giá Trị Vượt Trội</h1>
              <p className="lead mb-4 text-light opacity-90">
                Khám phá hàng ngàn sản phẩm chính hãng với bảo hành toàn diện, giao hàng nhanh và chương trình trả góp 0% lãi suất.
              </p>
              <div className="d-flex gap-3">
                <Link to="/products" className="btn btn-light btn-lg rounded-pill px-4 text-success fw-bold d-flex align-items-center">
                  Xem ngay sản phẩm <ArrowRight size={18} className="ms-2" />
                </Link>
                <Link to="/products?loai=1001" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  Laptop Giảm Sốc
                </Link>
              </div>
            </div>
            <div className="col-lg-5 text-center mt-4 mt-lg-0">
              <img
                src="/img/carousel-1.png"
                alt="Banner HDPE"
                className="img-fluid rounded-3"
                style={{ maxHeight: '340px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/logo2.png';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center p-2">
                <Truck size={32} className="text-success me-3" />
                <div className="text-start">
                  <h6 className="mb-0 fw-bold">Giao Hàng Miễn Phí</h6>
                  <small className="text-muted">Đơn hàng từ $100</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center p-2">
                <ShieldCheck size={32} className="text-success me-3" />
                <div className="text-start">
                  <h6 className="mb-0 fw-bold">Chính Hãng 100%</h6>
                  <small className="text-muted">Bảo hành chính hãng</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center p-2">
                <Headphones size={32} className="text-success me-3" />
                <div className="text-start">
                  <h6 className="mb-0 fw-bold">Hỗ Trợ 24/7</h6>
                  <small className="text-muted">Tư vấn tận tâm</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center p-2">
                <Tag size={32} className="text-success me-3" />
                <div className="text-start">
                  <h6 className="mb-0 fw-bold">Thanh Toán VietQR</h6>
                  <small className="text-muted">Quét mã tiện lợi</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">Danh Mục Sản Phẩm</h3>
              <p className="text-muted small mb-0">Các nhóm sản phẩm nổi bật tại HDPE Shop</p>
            </div>
            <Link to="/products" className="btn btn-outline-success btn-sm rounded-pill px-3">
              Xem tất cả
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.maLoai} className="col-lg-3 col-md-4 col-6">
                <Link
                  to={`/products?loai=${cat.maLoai}`}
                  className="card h-100 border-0 shadow-sm text-decoration-none text-dark hover-scale rounded-4 p-3 text-center bg-white"
                >
                  <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <img
                      src={cat.hinh ? `/img/${cat.hinh}` : '/img/logo2.png'}
                      alt={cat.tenLoai}
                      style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/logo2.png';
                      }}
                    />
                  </div>
                  <h6 className="fw-bold mb-1">{cat.tenLoai}</h6>
                  <span className="badge bg-light text-muted small">{cat.soLuong} sản phẩm</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">Sản Phẩm Bán Chạy</h3>
              <p className="text-muted small mb-0">Tuyển tập những thiết bị công nghệ được yêu thích nhất</p>
            </div>
            <Link to="/products" className="btn btn-success btn-sm rounded-pill px-3">
              Xem toàn bộ kho hàng
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang kết nối API lấy dữ liệu sản phẩm...</p>
            </div>
          ) : (
            <div className="row g-4">
              {featuredProducts.map((prod) => (
                <div key={prod.maHh} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card position-relative">
                    {prod.giamGia > 0 && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2 z-1">
                        -{Math.round(prod.giamGia * 100)}%
                      </span>
                    )}

                    <Link to={`/products/${prod.maHh}`} className="text-decoration-none">
                      <div className="product-img-wrapper p-3 bg-light text-center" style={{ height: '220px' }}>
                        <img
                          src={prod.hinh?.startsWith('http') ? prod.hinh : (prod.hinh ? `/img/Hinh/${prod.hinh}` : '/img/logo2.png')}
                          alt={prod.tenHh}
                          className="img-fluid h-100 object-fit-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/img/logo2.png';
                          }}
                        />
                      </div>
                    </Link>

                    <div className="card-body d-flex flex-column p-3">
                      <small className="text-muted mb-1">{prod.tenLoai || 'Công nghệ'}</small>
                      <h6 className="card-title fw-semibold text-truncate mb-2" title={prod.tenHh}>
                        <Link to={`/products/${prod.maHh}`} className="text-dark text-decoration-none">
                          {prod.tenHh}
                        </Link>
                      </h6>
                      <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                        <div>
                          <span className="text-danger fw-bold fs-5">${prod.donGia ?? 0}</span>
                        </div>
                        <button
                          onClick={() => handleAdd(prod.maHh)}
                          disabled={addingId === prod.maHh}
                          className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center"
                        >
                          <ShoppingBag size={14} className="me-1" />
                          {addingId === prod.maHh ? 'Đang thêm...' : 'Mua ngay'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
