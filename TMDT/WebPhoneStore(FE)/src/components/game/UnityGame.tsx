import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { Play, Ticket, Coins, Eye, Lock, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { puzzleApi } from '../../api/services';
import { GameStatus } from '../../types';
import './UnityGame.css';

export const UnityGame: React.FC = () => {
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const activeSessionIdRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  const updateActiveSessionId = (id: number | null) => {
    activeSessionIdRef.current = id;
    setActiveSessionId(id);
  };

  const {
    unityProvider,
    addEventListener,
    removeEventListener,
    sendMessage,
    isLoaded,
    loadingProgression,
  } = useUnityContext({
    loaderUrl: '/unity/puzzle/Build/web.loader.js',
    dataUrl: '/unity/puzzle/Build/web.data.br',
    frameworkUrl: '/unity/puzzle/Build/web.framework.js.br',
    codeUrl: '/unity/puzzle/Build/web.wasm.br',
  });

  // 1. Fetch game status
  const fetchGameStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const data = await puzzleApi.getStatus();
      if (data) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Lỗi lấy trạng thái game:', error);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchGameStatus();
  }, [fetchGameStatus]);

  // Synchronize coins & tickets to Unity when loaded or changed
  useEffect(() => {
    if (isLoaded && status) {
      try {
        sendMessage(
          'GameManager',
          'UpdateGameInfo',
          JSON.stringify({
            tickets: status.tickets,
            currentCoins: status.currentCoins,
            currentLevel: status.currentLevel,
          })
        );
      } catch (err) {
        console.warn('Không thể gửi UpdateGameInfo tới Unity:', err);
      }
    }
  }, [isLoaded, status, sendMessage]);

  // 2. Start game session
  const handleStartGame = useCallback(async () => {
    try {
      const data = await puzzleApi.startPuzzle();
      if (data && data.success) {
        const newSessionId = data.sessionId;
        updateActiveSessionId(newSessionId);
        setIsPlaying(true);
        setNotification({ type: 'info', message: `Bắt đầu màn ${data.levelNumber}! Hãy ghép các mảnh tranh nhanh nhất có thể.` });

        setStatus((prev) =>
          prev
            ? {
                ...prev,
                tickets: data.tickets,
                currentCoins: data.currentCoins,
              }
            : null
        );

        if (isLoaded) {
          const initPayload = JSON.stringify({
            sessionId: newSessionId,
            levelNumber: data.levelNumber,
            imageIndex: data.imageIndex ?? 0,
            tickets: data.tickets,
            currentCoins: data.currentCoins,
          });

          sendMessage('GameManager', 'InitLevelSession', initPayload);
          console.log('-> Kích hoạt Unity Session thành công:', initPayload);
        }
      } else {
        setNotification({ type: 'danger', message: data?.message || 'Không thể bắt đầu lượt chơi!' });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lỗi khi tạo Session chơi. Kiểm tra lại số vé!';
      setNotification({ type: 'danger', message: msg });
    }
  }, [isLoaded, sendMessage]);

  // 3. Unity Event handlers
  const handleUnityReady = useCallback(() => {
    console.log('Unity Canvas đã load sẵn sàng!');
    fetchGameStatus();
  }, [fetchGameStatus]);

  const handleUnityPlayRequested = useCallback(() => {
    console.log('Unity bấm Play/Replay/Next -> Tạo Session mới...');
    handleStartGame();
  }, [handleStartGame]);

  const handleGameComplete = useCallback(
    async (sessionIdFromUnity: number, result: string) => {
      let validSessionId = sessionIdFromUnity;
      if (!validSessionId || validSessionId <= 0) {
        validSessionId = activeSessionIdRef.current || activeSessionId || 0;
      }

      const validResult = result || 'Win';
      console.log(`Unity báo hoàn thành Session [${validSessionId}]:`, validResult);

      if (!validSessionId || validSessionId <= 0) {
        setNotification({ type: 'danger', message: 'Session không hợp lệ! Vui lòng thử lại.' });
        setIsPlaying(false);
        return;
      }

      try {
        const data = await puzzleApi.completePuzzle(validSessionId, validResult);
        if (data && data.success) {
          const isWin = validResult === 'Win';
          setNotification({
            type: isWin ? 'success' : 'info',
            message: isWin
              ? `🎉 CHIẾN THẮNG! Bạn đã nhận được +${data.rewardCoins ?? 0} Xu HDPE!`
              : `😢 HẾT THỜI GIAN! Nhận +${data.rewardCoins ?? 0} Xu an ủi. Hãy thử lại nhé!`,
          });

          await fetchGameStatus();
          setIsPlaying(false);
          updateActiveSessionId(null);
        } else {
          setNotification({ type: 'danger', message: `Không thể hoàn thành: ${data?.message}` });
        }
      } catch (error) {
        console.error('Lỗi gửi kết quả complete session:', error);
      }
    },
    [activeSessionId, fetchGameStatus]
  );

  // Listen to events from Unity jslib
  useEffect(() => {
    addEventListener('OnUnityReady', handleUnityReady);
    addEventListener('OnUnityPlayRequested', handleUnityPlayRequested);
    addEventListener('OnPuzzleCompleted', handleGameComplete);

    return () => {
      removeEventListener('OnUnityReady', handleUnityReady);
      removeEventListener('OnUnityPlayRequested', handleUnityPlayRequested);
      removeEventListener('OnPuzzleCompleted', handleGameComplete);
    };
  }, [addEventListener, removeEventListener, handleUnityReady, handleUnityPlayRequested, handleGameComplete]);

  // 4. Watch product to get ticket
  const handleWatchProductToGetTicket = async () => {
    try {
      const startData = await puzzleApi.startProductView(1);
      const viewId = startData.productViewId;

      // Open products page in new tab
      window.open('/products', '_blank');

      setIsWatchingAd(true);
      setAdTimer(10);

      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // After 10s, complete and claim
      setTimeout(async () => {
        try {
          const compData = await puzzleApi.completeProductView(viewId);
          if (compData.isQualified) {
            const claimData = await puzzleApi.claimTicket(viewId);
            if (claimData.success) {
              setNotification({ type: 'success', message: '🎉 Bạn đã nhận được 1 Vé Chơi Game mới!' });
              fetchGameStatus();
            }
          }
        } catch (err) {
          console.error('Lỗi hoàn thành xem sản phẩm:', err);
        } finally {
          setIsWatchingAd(false);
        }
      }, 10500);
    } catch (error) {
      console.error('Lỗi khi mở lượt xem sản phẩm:', error);
      setIsWatchingAd(false);
    }
  };

  const handleLockDailyProgress = async () => {
    if (window.confirm('Bạn có chắc muốn kết thúc chuỗi chơi hôm nay? Bạn sẽ không thể chơi tiếp cho đến ngày mai.')) {
      try {
        const res = await puzzleApi.lockDailyProgress();
        if (res && res.success) {
          setNotification({ type: 'info', message: res.message });
          fetchGameStatus();
        }
      } catch (err) {
        console.error('Lỗi khóa chuỗi chơi:', err);
      }
    }
  };

  return (
    <div className="game-wrapper py-3">
      {/* Thông báo Alert */}
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center rounded-3 shadow-sm mb-4`} role="alert">
          {notification.type === 'success' ? <CheckCircle size={20} className="me-2" /> : <AlertCircle size={20} className="me-2" />}
          <div>{notification.message}</div>
          <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
        </div>
      )}

      {/* Thanh Dashboard Trạng Thái */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row align-items-center g-3">
          <div className="col-6 col-md-3 text-center border-end">
            <span className="text-muted small d-block">Màn hiện tại</span>
            <span className="fw-bold fs-4 text-primary">Màn {status?.currentLevel || 1} / 5</span>
          </div>

          <div className="col-6 col-md-3 text-center border-end">
            <span className="text-muted small d-block">Vé chơi còn lại</span>
            <span className="fw-bold fs-4 text-danger d-inline-flex align-items-center">
              <Ticket size={22} className="me-1" /> {status?.tickets ?? 0}
            </span>
          </div>

          <div className="col-6 col-md-3 text-center border-end">
            <span className="text-muted small d-block">Xu tích lũy</span>
            <span className="fw-bold fs-4 text-warning d-inline-flex align-items-center">
              <Coins size={22} className="me-1" /> {status?.currentCoins ?? 0}
            </span>
          </div>

          <div className="col-6 col-md-3 text-center">
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center"
                onClick={fetchGameStatus}
                disabled={loadingStatus}
                title="Làm mới trạng thái"
              >
                <RefreshCw size={14} className={loadingStatus ? 'spin' : ''} />
              </button>
              {status?.status === 'Playing' && (
                <button
                  className="btn btn-outline-danger btn-sm rounded-pill"
                  onClick={handleLockDailyProgress}
                  title="Dừng chuỗi chơi hôm nay"
                >
                  <Lock size={14} className="me-1" /> Khóa hôm nay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Khung Unity WebGL Game Canvas */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-dark">
        <div className="card-header bg-dark text-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold d-flex align-items-center">
            🎮 HDPE Puzzle Challenge
          </h5>
          <span className="badge bg-success rounded-pill px-3 py-2">
            Trạng thái: {status?.status === 'Playing' ? 'Đang mở' : status?.status}
          </span>
        </div>

        <div className="unity-container position-relative">
          {!isLoaded && (
            <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
              <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }}></div>
              <h5>Đang tải tài nguyên Game Unity WebGL...</h5>
              <div className="progress mx-auto mt-2" style={{ width: '280px', height: '10px' }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                  style={{ width: `${Math.round(loadingProgression * 100)}%` }}
                ></div>
              </div>
              <small className="text-muted mt-1 d-block">{Math.round(loadingProgression * 100)}%</small>
            </div>
          )}
          <Unity unityProvider={unityProvider} tabIndex={1} className="unity-canvas" />
        </div>

        {/* Nút điều khiển bên dưới Game */}
        <div className="card-footer bg-light p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex gap-2">
            <button
              onClick={handleStartGame}
              disabled={!status?.canPlay || isPlaying}
              className="btn btn-success btn-lg rounded-pill fw-bold px-4 d-flex align-items-center shadow-sm"
            >
              <Play size={20} className="me-2" />
              {isPlaying ? 'Đang chơi...' : 'Bắt đầu ghép tranh'}
            </button>

            {status?.canClaimProductTicket && (
              <button
                onClick={handleWatchProductToGetTicket}
                disabled={isWatchingAd}
                className="btn btn-outline-primary btn-lg rounded-pill fw-bold px-4 d-flex align-items-center"
              >
                <Eye size={20} className="me-2" />
                {isWatchingAd ? `Đang xem sản phẩm (${adTimer}s)...` : 'Xem sản phẩm (+1 Vé)'}
              </button>
            )}
          </div>

          <div className="text-muted small">
            💡 <strong>Mẹo:</strong> Thắng màn chơi nhận tới <strong>+250 Xu</strong>, đổi được Voucher giảm giá $50 trong Cửa hàng!
          </div>
        </div>
      </div>
    </div>
  );
};
