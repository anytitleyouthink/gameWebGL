import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [hoTen, setHoTen] = useState(user?.hoTen || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dienThoai, setDienThoai] = useState(user?.dienThoai || '');
  const [diaChi, setDiaChi] = useState(user?.diaChi || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await authApi.updateProfile({
        hoTen: hoTen.trim(),
        email: email.trim(),
        dienThoai: dienThoai.trim(),
        diaChi: diaChi.trim(),
      });

      if (res.success && res.data) {
        updateUser(res.data);
        setMessage({ text: 'Cập nhật hồ sơ thành công!', success: true });
        setIsEditing(false);
      } else {
        setMessage({ text: res.message || 'Cập nhật thất bại.', success: false });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.', success: false });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '640px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div className="d-flex align-items-center">
            <div className="bg-success text-white rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
              <User size={32} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{user.hoTen || user.maKh}</h4>
              <small className="text-muted">Tài khoản: <strong>{user.maKh}</strong></small>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center"
          >
            <Edit2 size={14} className="me-1" />
            {isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}
          </button>
        </div>

        {message && (
          <div className={`alert ${message.success ? 'alert-success' : 'alert-danger'} py-2 px-3 small rounded-3 d-flex align-items-center mb-3`}>
            {message.success ? <CheckCircle size={16} className="me-2" /> : <AlertCircle size={16} className="me-2" />}
            <span>{message.text}</span>
          </div>
        )}

        {!isEditing ? (
          /* Chế độ xem */
          <div className="list-group list-group-flush">
            <div className="list-group-item d-flex justify-content-between py-3 border-0">
              <span className="text-muted d-flex align-items-center"><Mail size={16} className="me-2" /> Email:</span>
              <span className="fw-semibold">{user.email}</span>
            </div>
            <div className="list-group-item d-flex justify-content-between py-3 border-0">
              <span className="text-muted d-flex align-items-center"><Phone size={16} className="me-2" /> Số điện thoại:</span>
              <span className="fw-semibold">{user.dienThoai || 'Chưa cập nhật'}</span>
            </div>
            <div className="list-group-item d-flex justify-content-between py-3 border-0">
              <span className="text-muted d-flex align-items-center"><MapPin size={16} className="me-2" /> Địa chỉ giao hàng:</span>
              <span className="fw-semibold text-end" style={{ maxWidth: '300px' }}>{user.diaChi || 'Chưa cập nhật'}</span>
            </div>
            <div className="list-group-item d-flex justify-content-between py-3 border-0">
              <span className="text-muted">Vai trò tài khoản:</span>
              <span className="badge bg-success">{user.vaiTro === 1 ? 'Quản trị viên (Admin)' : 'Khách hàng'}</span>
            </div>
          </div>
        ) : (
          /* Chế độ chỉnh sửa */
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Địa chỉ Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Số điện thoại</label>
              <input
                type="tel"
                className="form-control"
                value={dienThoai}
                onChange={(e) => setDienThoai(e.target.value)}
                placeholder="0901234567..."
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                placeholder="Địa chỉ giao hàng mặc định..."
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" disabled={loading} className="btn btn-success rounded-pill px-4 fw-bold">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline-secondary rounded-pill px-3">
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
