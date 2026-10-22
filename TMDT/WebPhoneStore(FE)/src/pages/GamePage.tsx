import React from 'react';
import { UnityGame } from '../components/game/UnityGame';
import { Link } from 'react-router-dom';
import { Gift, ArrowRight } from 'lucide-react';

export const GamePage: React.FC = () => {
  return (
    <div className="container py-4">
      {/* Breadcrumb & Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🎮 Minigame Xếp Hình Nhận Xu</h2>
          <p className="text-muted small mb-0">
            Vượt qua các màn ghép tranh công nghệ đỉnh cao để tích lũy Xu HDPE đổi Voucher giảm giá!
          </p>
        </div>

        <Link to="/vouchers" className="btn btn-warning rounded-pill px-4 fw-bold d-flex align-items-center text-dark shadow-sm">
          <Gift size={18} className="me-2" /> Đổi Voucher & Vòng Quay <ArrowRight size={16} className="ms-1" />
        </Link>
      </div>

      {/* Unity Game Component */}
      <UnityGame />
    </div>
  );
};
