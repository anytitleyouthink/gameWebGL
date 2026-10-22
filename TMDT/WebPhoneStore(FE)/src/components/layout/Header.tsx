import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Clock, ListOrdered, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/services';
import { HangHoaSearchDto } from '../../types';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<HangHoaSearchDto[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productApi.searchProducts(keyword);
        if (res.success && res.data) {
          setSearchResults(res.data);
          setShowResults(true);
        }
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowResults(false);
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <header className="hdpe-header">
      {/* Top bar */}
      <div className="top-bar bg-dark text-light py-1 px-3 px-md-4 px-lg-5 d-flex justify-content-between align-items-center w-100">
        <div className="small">
          <span>Chào mừng bạn đến với <strong>HDPE Shop</strong> - Hệ thống sản phẩm chính hãng</span>
        </div>
        <div className="d-flex align-items-center gap-3 small">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-light text-decoration-none">
                <User size={14} className="me-1" />
                Chào, <strong>{user?.hoTen || user?.maKh}</strong>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="badge bg-danger text-decoration-none">
                  <Shield size={12} className="me-1" /> Quản trị
                </Link>
              )}
              <Link to="/orders/history" className="text-light text-decoration-none">
                <Clock size={14} className="me-1" /> Lịch sử đơn
              </Link>
              <button onClick={() => logout()} className="btn btn-link btn-sm text-light p-0 text-decoration-none">
                <LogOut size={14} className="me-1" /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-light text-decoration-none">Đăng nhập</Link>
              <span>|</span>
              <Link to="/register" className="text-light text-decoration-none">Đăng ký</Link>
            </>
          )}
        </div>
      </div>

      {/* Main header */}
      <div className="main-header bg-white shadow-sm py-3 px-3 px-md-4 px-lg-5 w-100">
        <div className="container-fluid px-0 d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Link to="/" className="d-flex align-items-center text-decoration-none text-dark">
            <img src="/img/logo2.png" alt="HDPE Shop Logo" style={{ height: '48px', objectFit: 'contain' }} onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }} />
            <span className="ms-2 fs-3 fw-bold text-success">HDPE<span className="text-dark">Shop</span></span>
          </Link>

          {/* Search box with live suggestions */}
          <div className="search-container position-relative flex-grow-1 mx-4" style={{ maxWidth: '500px' }}>
            <form onSubmit={handleSearchSubmit} className="d-flex">
              <input
                type="text"
                className="form-control rounded-pill pe-5"
                placeholder="Tìm kiếm sản phẩm theo tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => keyword.trim() && setShowResults(true)}
              />
              <button
                type="submit"
                className="btn btn-success position-absolute end-0 top-0 bottom-0 rounded-pill px-3 m-1 d-flex align-items-center justify-content-center"
                style={{ width: '40px' }}
              >
                <Search size={18} />
              </button>
            </form>

            {/* Live Search dropdown */}
            {showResults && searchResults.length > 0 && (
              <div
                className="position-absolute start-0 end-0 bg-white shadow-lg rounded-3 mt-1 p-2 border"
                style={{ zIndex: 1050 }}
              >
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    onClick={() => setShowResults(false)}
                    className="d-flex align-items-center p-2 text-decoration-none text-dark border-bottom hover-bg"
                  >
                    <img
                      src={
                        item.image
                          ? item.image.startsWith('http')
                            ? item.image
                            : `/img/Hinh/${item.image}`
                          : '/img/logo2.png'
                      }
                      alt={item.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      className="rounded me-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/logo2.png';
                      }}
                    />
                    <div className="flex-grow-1 text-truncate">
                      <div className="fw-semibold text-truncate small">{item.name}</div>
                      <div className="text-danger small fw-bold">${item.price ?? 0}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="d-flex align-items-center gap-2">
            <Link to="/products" className="btn btn-outline-secondary btn-sm d-none d-lg-flex align-items-center rounded-pill px-3">
              <ListOrdered size={16} className="me-1" /> Sản phẩm
            </Link>

            <Link to="/game" className="btn btn-outline-success btn-sm d-flex align-items-center rounded-pill px-3 fw-semibold">
              <span className="me-1">🎮</span> Game Xếp Hình
            </Link>

            <Link to="/vouchers" className="btn btn-outline-warning text-dark btn-sm d-flex align-items-center rounded-pill px-3 fw-semibold">
              <span className="me-1">🎁</span> Voucher & Quay
            </Link>

            <Link to="/cart" className="btn btn-success position-relative rounded-pill px-3 py-2 d-flex align-items-center ms-1">
              <ShoppingCart size={18} className="me-2" />
              <span>Giỏ hàng</span>
              {cart && cart.totalQuantity > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
