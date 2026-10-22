import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || (location.state as any)?.from || '/';

  const fillAdminCredentials = () => {
    setUserName('admin');
    setPassword('123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập/email và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.login({ userName: userName.trim(), password });
      if (res.success && res.data) {
        const token = res.data.accessToken || res.data.token;
        const refreshToken = res.data.refreshToken || '';
        login(token, refreshToken, res.data.user);

        // Nếu là admin và không có trang trước đó cụ thể, chuyển hướng thẳng vào /admin
        if (res.data.user.vaiTro === 1 && (from === '/' || from === '/login')) {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setErrorMessage(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center py-5 px-3 overflow-y-auto bg-light">
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 w-100 bg-white my-auto" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="bg-success-subtle text-success d-inline-flex p-3 rounded-circle mb-3 shadow-sm">
            <LogIn size={32} />
          </div>
          <h3 className="fw-bold mb-1">Đăng Nhập Hệ Thống</h3>
          <p className="text-muted small">Chào mừng bạn quay lại với HDPE Shop</p>
        </div>

        {/* Demo Admin Quick Button */}
        <div className="alert alert-light border border-success-subtle rounded-3 p-3 mb-4 text-start">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <ShieldCheck size={20} className="text-success me-2 flex-shrink-0" />
              <div>
                <strong className="small text-dark d-block">Tài khoản Admin mặc định</strong>
                <span className="small text-muted">admin / 123 (Full quyền)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold"
            >
              Điền nhanh
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center mb-3">
            <AlertCircle size={16} className="me-2 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Tên đăng nhập hoặc Email *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <User size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 py-2"
                placeholder="Nhập tên đăng nhập hoặc email (ví dụ: admin)..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label small fw-semibold mb-1">Mật khẩu *</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 py-2"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-success btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng Nhập</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 small text-muted">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-success fw-bold text-decoration-none">
            Đăng ký thành viên mới
          </Link>
        </div>
      </div>
    </div>
  );
};
