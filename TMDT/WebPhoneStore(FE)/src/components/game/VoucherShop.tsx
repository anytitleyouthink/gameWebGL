import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tag, Sparkles, Gift, Coins, CheckCircle, Copy, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameVoucherApi, puzzleApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ShopVoucher, UserVoucher, SpinWheelResponse } from '../../types';
import './VoucherShop.css';

const WHEEL_SLICES = [
  { label: 'Voucher $50', color: '#FF5722', isWin: true },
  { label: 'May Mắn Lần Sau', color: '#6c757d', isWin: false },
  { label: 'Voucher $20', color: '#E91E63', isWin: true },
  { label: 'May Mắn Lần Sau', color: '#6c757d', isWin: false },
  { label: 'Voucher 10%', color: '#9C27B0', isWin: true },
  { label: 'May Mắn Lần Sau', color: '#6c757d', isWin: false },
];

interface RewardModalData {
  type: 'purchase' | 'spin_win' | 'spin_lose';
  title: string;
  message: string;
  voucherCode?: string;
  voucherName?: string;
  discountValue?: number;
  coinSpent?: number;
  remainingCoins?: number;
}

export const VoucherShop: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'shop' | 'wheel' | 'my'>('shop');
  const [coins, setCoins] = useState<number>(0);
  const [vouchers, setVouchers] = useState<ShopVoucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);

  // Vòng quay states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<SpinWheelResponse | null>(null);
  const currentAngleRef = useRef<number>(0);

  // 1. Fetch user coins
  const fetchCoins = useCallback(async () => {
    try {
      const data = await puzzleApi.getStatus();
      if (data) {
        setCoins(data.currentCoins ?? 0);
      }
    } catch (err) {
      console.error('Lỗi lấy số coin:', err);
    }
  }, []);

  // 2. Fetch Shop vouchers
  const fetchShopVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gameVoucherApi.getShopVouchers();
      if (data) {
        setVouchers(data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách voucher:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Fetch My Vouchers
  const fetchMyVouchers = useCallback(async () => {
    try {
      const data = await gameVoucherApi.getMyVouchers();
      if (data) {
        setMyVouchers(data);
      }
    } catch (err) {
      console.error('Lỗi lấy voucher của tôi:', err);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
    fetchShopVouchers();
    fetchMyVouchers();
  }, [fetchCoins, fetchShopVouchers, fetchMyVouchers]);

  // Vẽ Vòng Quay Canvas
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < numSlices; i++) {
      const start = i * sliceAngle;
      const end = start + sliceAngle;

      // Slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_SLICES[i].color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(WHEEL_SLICES[i].label, radius - 20, 5);
      ctx.restore();
    }

    // Tâm vòng quay
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.restore();
  }, []);

  useEffect(() => {
    if (activeTab === 'wheel') {
      drawWheel(currentAngleRef.current);
    }
  }, [activeTab, drawWheel]);

  // Xử lý Quay Thưởng
  const handleSpin = async () => {
    if (isSpinning) return;
    if (coins < 20) {
      showError('Vòng quay may mắn', 'Bạn không đủ Xu để quay (Cần 20 Xu). Hãy chơi Game Xếp Hình để kiếm thêm Xu!');
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);

    try {
      const result: SpinWheelResponse = await gameVoucherApi.spinWheel();
      if (!result.success) {
        showError('Quay thưởng', result.message || 'Quay thưởng thất bại!');
        setIsSpinning(false);
        return;
      }

      const numSlices = WHEEL_SLICES.length;
      const sliceAngle = (2 * Math.PI) / numSlices;

      const targetIndex = result.targetSliceIndex;
      // Góc cần dừng để mũi tên ở trên đỉnh (3 * PI / 2) trỏ đúng ô
      const desiredCanvasAngle = (3 * Math.PI) / 2 - (targetIndex * sliceAngle + sliceAngle / 2);

      const extraRotations = 5 * 2 * Math.PI; // 5 vòng tròn đầy đủ
      const finalAngle = extraRotations + desiredCanvasAngle;

      const startAngle = currentAngleRef.current % (2 * Math.PI);
      const totalDelta = finalAngle - startAngle;

      const duration = 4000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing cubic out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAngle = startAngle + totalDelta * easeOut;

        currentAngleRef.current = currentAngle;
        drawWheel(currentAngle);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          setSpinResult(result);
          setCoins(result.remainingCoins);
          fetchMyVouchers();

          if (result.isWin) {
            showSuccess('Quay Thưởng Thành Công', `🎉 Bạn đã trúng ${result.voucherName}!`);
            setRewardModal({
              type: 'spin_win',
              title: '🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG VOUCHER!',
              message: `Bạn đã quay trúng voucher ưu đãi: ${result.voucherName}! Mã đã được tự động lưu vào túi đồ.`,
              voucherCode: result.voucherCode || undefined,
              voucherName: result.voucherName || undefined,
              discountValue: result.discountValue,
              coinSpent: 20,
              remainingCoins: result.remainingCoins,
            });
          } else {
            showInfo('Vòng quay may mắn', 'Chúc bạn may mắn lần sau!');
            setRewardModal({
              type: 'spin_lose',
              title: '😢 CHÚC BẠN MAY MẮN LẦN SAU!',
              message: 'Lượt quay này chưa trúng rồi. Đừng nản lòng, hãy tích lũy thêm Xu từ Game Xếp Hình và quay tiếp nhé!',
              coinSpent: 20,
              remainingCoins: result.remainingCoins,
            });
          }
        }
      };

      requestAnimationFrame(animate);
    } catch (error: any) {
      setIsSpinning(false);
      showError('Quay thưởng', error.response?.data?.message || 'Lỗi khi quay thưởng!');
    }
  };

  // Đổi Voucher Bằng Xu
  const handlePurchase = async (voucherId: number) => {
    setPurchasingId(voucherId);
    try {
      const res = await gameVoucherApi.purchaseVoucher(voucherId);
      if (res && res.success) {
        setCoins(res.remainingCoins);
        await fetchShopVouchers();
        await fetchMyVouchers();

        showSuccess('Đổi Voucher Thành Công', `🎉 ${res.voucherName} - Mã: ${res.voucherCode}`);
        setRewardModal({
          type: 'purchase',
          title: '🎉 ĐỔI VOUCHER THÀNH CÔNG!',
          message: res.message || 'Bạn đã đổi voucher thành công bằng Xu!',
          voucherCode: res.voucherCode,
          voucherName: res.voucherName,
          coinSpent: res.coinSpent,
          remainingCoins: res.remainingCoins,
        });
      } else {
        showError('Đổi voucher', res?.message || 'Đổi voucher thất bại!');
      }
    } catch (err: any) {
      showError('Đổi voucher', err.response?.data?.message || 'Lỗi kết nối khi đổi voucher!');
    } finally {
      setPurchasingId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="voucher-shop-wrapper container py-4">
      {/* Header số Xu và Tiêu đề */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center">
              <Gift size={28} className="text-danger me-2" /> Cửa Hàng Voucher & Vòng Quay May Mắn
            </h3>
            <p className="text-muted small mb-0">
              Dùng Xu tích lũy từ Game Xếp Hình để đổi Voucher giảm giá trực tiếp khi mua sắm điện thoại!
            </p>
          </div>

          <div className="bg-warning-subtle border border-warning rounded-pill px-4 py-2 d-flex align-items-center">
            <Coins size={24} className="text-warning me-2" />
            <span className="text-dark fw-bold me-1">Số dư Xu:</span>
            <span className="fs-4 fw-bold text-danger">{coins}</span>
          </div>
        </div>
      </div>

      {/* Tabs Chuyển Đổi */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center ${
            activeTab === 'shop' ? 'btn-success shadow-sm' : 'btn-outline-secondary'
          }`}
          onClick={() => setActiveTab('shop')}
        >
          <Tag size={18} className="me-2" /> Đổi Voucher Bằng Xu
        </button>

        <button
          className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center ${
            activeTab === 'wheel' ? 'btn-danger shadow-sm' : 'btn-outline-secondary'
          }`}
          onClick={() => setActiveTab('wheel')}
        >
          <Sparkles size={18} className="me-2" /> Vòng Quay May Mắn
        </button>

        <button
          className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center ${
            activeTab === 'my' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
          }`}
          onClick={() => setActiveTab('my')}
        >
          <Gift size={18} className="me-2" /> Voucher Của Tôi ({myVouchers.length})
        </button>
      </div>

      {/* TAB 1: SHOP VOUCHER */}
      {activeTab === 'shop' && (
        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-success"></div>
              <p className="text-muted mt-2">Đang tải danh sách voucher...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
              <Tag size={48} className="text-muted mb-2" />
              <p className="text-muted">Hiện chưa có voucher nào mở bán.</p>
            </div>
          ) : (
            vouchers.map((v) => (
              <div key={v.voucherId} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-column justify-content-between position-relative overflow-hidden voucher-card-item">
                  <div className="border-bottom pb-3 mb-3">
                    <span className="badge bg-danger mb-2 fw-semibold">
                      {v.discountType === 'Percent' ? `GIẢM ${v.discountValue}%` : `GIẢM $${v.discountValue}`}
                    </span>
                    <h5 className="fw-bold text-dark mb-1">{v.voucherName}</h5>
                    <p className="text-muted small mb-0">{v.description}</p>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small text-muted mb-2">
                      <span>Đơn tối thiểu:</span>
                      <span className="fw-bold text-dark">${v.minOrderAmount}</span>
                    </div>
                    <div className="d-flex justify-content-between small text-muted mb-3">
                      <span>Còn lại:</span>
                      <span className="fw-bold text-success">{v.remainingQuantity} mã</span>
                    </div>

                    <button
                      className="btn btn-warning w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center text-dark"
                      onClick={() => handlePurchase(v.voucherId)}
                      disabled={purchasingId === v.voucherId || coins < v.coinPrice || v.remainingQuantity <= 0}
                    >
                      <Coins size={16} className="me-2" />
                      {purchasingId === v.voucherId
                        ? 'Đang đổi...'
                        : `Đổi ngay (${v.coinPrice} Xu)`}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: VÒNG QUAY MAY MẮN */}
      {activeTab === 'wheel' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
          <h4 className="fw-bold text-danger mb-2">🎡 Vòng Quay May Mắn - Tỉ Lệ Trúng 30%</h4>
          <p className="text-muted small mb-4">
            Mỗi lượt quay chỉ tốn <strong>20 Xu</strong>. Cơ hội trúng Voucher lên tới <strong>$50</strong> áp dụng ngay khi mua điện thoại!
          </p>

          <div className="wheel-container">
            <div className="wheel-pointer"></div>
            <canvas ref={canvasRef} width={380} height={380} className="wheel-canvas" />
          </div>

          <div className="mt-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning || coins < 20}
              className="btn btn-danger btn-lg rounded-pill px-5 py-3 fw-bold shadow d-inline-flex align-items-center"
            >
              <Sparkles size={22} className="me-2" />
              {isSpinning ? 'Đang quay...' : 'QUAY NGAY (20 Xu / Lượt)'}
            </button>
          </div>

          {/* Kết quả Quay Thưởng */}
          {spinResult && (
            <div className={`alert ${spinResult.isWin ? 'alert-success' : 'alert-secondary'} mx-auto mt-4 rounded-4 p-4`} style={{ maxWidth: '500px' }}>
              <h5 className="fw-bold mb-2">{spinResult.message}</h5>
              {spinResult.isWin && spinResult.voucherCode && (
                <div className="mt-3">
                  <span className="small text-muted d-block mb-1">Mã voucher trúng thưởng của bạn:</span>
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <span className="fs-4 fw-bold text-success bg-white px-3 py-1 rounded border voucher-code-badge">
                      {spinResult.voucherCode}
                    </span>
                    <button
                      onClick={() => copyCode(spinResult.voucherCode!)}
                      className="btn btn-outline-success btn-sm rounded-pill"
                    >
                      {copiedCode === spinResult.voucherCode ? 'Đã chép!' : 'Copy'}
                    </button>
                  </div>
                  <Link to="/products" className="btn btn-success rounded-pill px-4 mt-3">
                    Mua sắm ngay <ArrowRight size={16} className="ms-1" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VOUCHER CỦA TÔI */}
      {activeTab === 'my' && (
        <div className="row g-4">
          {myVouchers.length === 0 ? (
            <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
              <Gift size={48} className="text-muted mb-2" />
              <p className="text-muted">Bạn chưa có voucher nào. Hãy đổi xu hoặc quay vòng quay may mắn nhé!</p>
            </div>
          ) : (
            myVouchers.map((uv) => (
              <div key={uv.userVoucherId} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white position-relative voucher-card-item">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${uv.status === 'Available' ? 'bg-success' : 'bg-secondary'} fw-semibold`}>
                      {uv.status === 'Available' ? 'Khả dụng' : uv.status}
                    </span>
                    <small className="text-muted">HSD: {new Date(uv.expiredAt).toLocaleDateString('vi-VN')}</small>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{uv.voucherName}</h5>
                  <p className="text-muted small mb-3">
                    Đơn hàng từ ${uv.minOrderAmount}
                  </p>

                  <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center mb-3 border">
                    <span className="fw-bold text-success fs-5 voucher-code-badge">{uv.voucherCode}</span>
                    <button
                      onClick={() => copyCode(uv.voucherCode)}
                      className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center"
                    >
                      {copiedCode === uv.voucherCode ? (
                        <>
                          <CheckCircle size={14} className="me-1 text-success" /> Đã chép
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="me-1" /> Sao chép
                        </>
                      )}
                    </button>
                  </div>

                  <Link to="/products" className="btn btn-outline-success rounded-pill w-100 fw-bold">
                    <ShoppingBag size={16} className="me-1" /> Mua sắm áp dụng
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL THÔNG BÁO THƯỞNG KHI MUA VOUCHER HOẶC DÙNG VÒNG QUAY */}
      {rewardModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 10500,
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => setRewardModal(null)}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 p-md-5 text-center bg-white position-relative"
            style={{ maxWidth: '480px', width: '100%', animation: 'fadeIn 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={() => setRewardModal(null)}
              aria-label="Close"
            ></button>

            {rewardModal.type === 'spin_lose' ? (
              <div>
                <div className="rounded-circle bg-secondary-subtle d-inline-flex p-3 text-secondary mb-3">
                  <Sparkles size={46} />
                </div>
                <h4 className="fw-bold text-dark mb-2">{rewardModal.title}</h4>
                <p className="text-muted small mb-3">{rewardModal.message}</p>
                <div className="bg-light rounded-4 p-3 mb-4 border small text-muted">
                  Chi phí lượt quay: <strong className="text-danger">-20 Xu</strong>
                  <br />
                  Số dư còn lại: <strong className="text-warning fs-6">{rewardModal.remainingCoins} Xu</strong>
                </div>
                <button
                  className="btn btn-secondary rounded-pill px-5 py-2 fw-bold"
                  onClick={() => setRewardModal(null)}
                >
                  Tiếp tục
                </button>
              </div>
            ) : (
              <div>
                <div className="rounded-circle bg-success-subtle d-inline-flex p-3 text-success mb-3 shadow-sm">
                  <Gift size={46} />
                </div>
                <h4 className="fw-bold text-success mb-2">{rewardModal.title}</h4>
                <p className="text-muted small mb-3">{rewardModal.message}</p>

                {rewardModal.voucherCode && (
                  <div className="bg-success-subtle border border-success rounded-4 p-3 mb-4">
                    <small className="text-muted d-block mb-1 fw-semibold">Mã Voucher của bạn:</small>
                    <div className="d-flex justify-content-center align-items-center gap-2 my-1">
                      <span className="fs-3 fw-bold text-success bg-white px-3 py-1 rounded-3 border border-success">
                        {rewardModal.voucherCode}
                      </span>
                      <button
                        onClick={() => copyCode(rewardModal.voucherCode!)}
                        className="btn btn-success rounded-pill px-3 py-2 fw-bold btn-sm d-flex align-items-center"
                      >
                        {copiedCode === rewardModal.voucherCode ? (
                          <>
                            <CheckCircle size={15} className="me-1" /> Đã chép
                          </>
                        ) : (
                          <>
                            <Copy size={15} className="me-1" /> Sao chép
                          </>
                        )}
                      </button>
                    </div>
                    <small className="text-success fw-semibold mt-2 d-block">
                      {rewardModal.voucherName} | Số dư còn lại: <strong>{rewardModal.remainingCoins} Xu</strong>
                    </small>
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center mt-3">
                  <button
                    className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold small"
                    onClick={() => {
                      setRewardModal(null);
                      setActiveTab('my');
                    }}
                  >
                    Xem Voucher của tôi
                  </button>
                  <Link
                    to="/products"
                    className="btn btn-success rounded-pill px-4 py-2 fw-bold small d-inline-flex align-items-center justify-content-center"
                    onClick={() => setRewardModal(null)}
                  >
                    Mua sắm ngay <ArrowRight size={16} className="ms-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
