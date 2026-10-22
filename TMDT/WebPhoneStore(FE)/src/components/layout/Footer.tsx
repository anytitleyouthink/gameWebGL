import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5 w-100">
      <div className="container-fluid px-3 px-md-4 px-lg-5">
        <div className="row g-4">
          {/* Cột 1: Thông tin công ty */}
          <div className="col-lg-4 col-md-6">
            <h5 className="text-success fw-bold mb-3">HDPE Shop</h5>
            <p className="text-muted small">
              HDPE Shop là hệ thống phân phối thiết bị điện tử, laptop, đồng hồ và phụ kiện công nghệ hàng đầu với tiêu chuẩn chất lượng cao và dịch vụ chu đáo.
            </p>
            <div className="d-flex flex-column gap-2 small text-muted">
              <div><MapPin size={16} className="text-success me-2" /> Biên Hòa, Đồng Nai, Việt Nam</div>
              <div><Phone size={16} className="text-success me-2" /> 0290 902 2005</div>
              <div><Mail size={16} className="text-success me-2" /> hdpeshop@gmail.com</div>
            </div>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Liên kết nhanh</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              <li><Link to="/" className="text-muted text-decoration-none hover-link">Trang chủ</Link></li>
              <li><Link to="/products" className="text-muted text-decoration-none hover-link">Tất cả sản phẩm</Link></li>
              <li><Link to="/cart" className="text-muted text-decoration-none hover-link">Giỏ hàng</Link></li>
              <li><Link to="/orders/history" className="text-muted text-decoration-none hover-link">Tra cứu đơn hàng</Link></li>
              <li><Link to="/privacy" className="text-muted text-decoration-none hover-link">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 3: Danh mục nổi bật */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Danh mục hàng đầu</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              <li><Link to="/products?loai=1001" className="text-muted text-decoration-none hover-link">Laptop & Máy tính</Link></li>
              <li><Link to="/products?loai=1003" className="text-muted text-decoration-none hover-link">Điện thoại thông minh</Link></li>
              <li><Link to="/products?loai=1000" className="text-muted text-decoration-none hover-link">Đồng hồ cao cấp</Link></li>
              <li><Link to="/products?loai=1002" className="text-muted text-decoration-none hover-link">Máy ảnh & Thiết bị quay</Link></li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận tin */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Bản tin ưu đãi</h6>
            <p className="small text-muted">Đăng ký để nhận thông tin voucher và khuyến mãi mới nhất.</p>
            <div className="input-group mb-3">
              <input type="text" className="form-control form-control-sm" placeholder="Email của bạn..." />
              <button className="btn btn-success btn-sm" type="button"><ArrowRight size={16} /></button>
            </div>
            <div className="d-flex gap-2">
              <span className="btn btn-sm btn-outline-light rounded-circle p-2"><Share2 size={16} /></span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        <div className="d-flex flex-wrap justify-content-between align-items-center small text-muted">
          <div>&copy; {new Date().getFullYear()} <strong>HDPE Shop</strong>. Bản quyền thuộc về Nhóm sinh viên HDPE.</div>
          <div>Hệ thống phát triển với ASP.NET Core Web API & React TypeScript.</div>
        </div>
      </div>
    </footer>
  );
};
