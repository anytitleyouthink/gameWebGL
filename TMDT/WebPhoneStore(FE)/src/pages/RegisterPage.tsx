import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '../api/services';

export const RegisterPage: React.FC = () => {
  const [maKh, setMaKh] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhau !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (matKhau.length < 3) {
      setErrorMessage('Mật khẩu phải có tối thiểu 3 ký tự.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.register({
        maKh: maKh.trim(),
        email: email.trim(),
        matKhau,
      });

      if (res.success) {
        setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setErrorMessage(res.message || 'Đăng ký không thành công.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Lỗi khi đăng ký tài khoản. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center py-5 px-3 overflow-y-auto bg-light">
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 w-100 bg-white my-auto" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <div className="bg-success-subtle text-success d-inline-flex p-3 rounded-circle mb-3 shadow-sm">
            <UserPlus size={32} />
          </div>
          <h3 className="fw-bold mb-1">Đăng Ký Thành Viên</h3>
          <p className="text-muted small">Tạo tài khoản để mua sắm và nhận ưu đãi từ HDPE Shop</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center mb-3">
            <AlertCircle size={16} className="me-2 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center mb-3">
            <CheckCircle size={16} className="me-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Tên đăng nhập / Mã tài khoản *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted"><User size={16} /></span>
              <input
                type="text"
                className="form-control border-start-0 py-2"
                placeholder="Ví dụ: nguyenvana..."
                value={maKh}
                onChange={(e) => setMaKh(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Địa chỉ Email *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted"><Mail size={16} /></span>
              <input
                type="email"
                className="form-control border-start-0 py-2"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Mật khẩu *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 py-2"
                placeholder="Tối thiểu 3 ký tự..."
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
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

          <div className="mb-4">
            <label className="form-label small fw-semibold">Xác nhận lại mật khẩu *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 py-2"
                placeholder="Nhập lại mật khẩu..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              <>
                <span>Đăng Ký Tài Khoản</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 small text-muted">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-success fw-bold text-decoration-none">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
