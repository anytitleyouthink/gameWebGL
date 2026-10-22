import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-4">
          <div className="bg-success-subtle text-success d-inline-flex p-3 rounded-circle mb-3">
            <ShieldAlert size={36} />
          </div>
          <h2 className="fw-bold">Chính Sách Bảo Mật</h2>
          <p className="text-muted small">Cập nhật lần cuối: 2026 - Bản quyền thuộc về HDPE Shop</p>
        </div>

        <div className="text-muted leading-relaxed small">
          <h5 className="text-dark fw-bold mb-2">1. Thu thập thông tin cá nhân</h5>
          <p>
            Khi quý khách đăng ký tài khoản hoặc đặt hàng tại HDPE Shop, hệ thống sẽ lưu trữ các thông tin cơ bản như Họ tên, Địa chỉ Email, Số điện thoại và Địa chỉ giao nhận nhằm phục vụ xử lý và vận chuyển đơn hàng.
          </p>

          <h5 className="text-dark fw-bold mb-2 mt-4">2. Bảo mật mật khẩu & tài khoản</h5>
          <p>
            Mật khẩu của khách hàng được mã hóa một chiều bằng thuật toán băm tiêu chuẩn công nghiệp (BCrypt Hash) trước khi lưu vào cơ sở dữ liệu. Không ai, kể cả quản trị viên hệ thống, có thể xem được mật khẩu dạng gốc của bạn.
          </p>

          <h5 className="text-dark fw-bold mb-2 mt-4">3. Xác thực thanh toán VietQR</h5>
          <p>
            Mọi giao dịch thanh toán chuyển khoản trực tuyến qua VietQR được tính toán chuẩn xác từ máy chủ backend của HDPE Shop và đối soát dựa trên mã hóa đơn duy nhất để bảo đảm quyền lợi tài chính tối đa cho quý khách.
          </p>

          <h5 className="text-dark fw-bold mb-2 mt-4">4. Cam kết bảo mật</h5>
          <p>
            HDPE Shop cam kết không chia sẻ, bán hoặc trao đổi thông tin khách hàng cho bất kỳ bên thứ ba nào ngoại trừ các đơn vị vận chuyển đối tác để giao hàng thành công.
          </p>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="btn btn-outline-success rounded-pill px-4">
            <ArrowLeft size={16} className="me-2" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
