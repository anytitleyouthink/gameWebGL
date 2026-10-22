import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ToastItem {
  id: string;
  type: 'success' | 'danger' | 'info' | 'warning' | 'cart';
  title?: string;
  message: string;
  image?: string | null;
  actionText?: string;
  actionLink?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showCartSuccess: (productName: string, quantity?: number, image?: string | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message: string) => {
      showToast({ type: 'danger', title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const showCartSuccess = useCallback(
    (productName: string, quantity = 1, image?: string | null) => {
      showToast({
        type: 'cart',
        title: 'Đã thêm vào giỏ hàng!',
        message: `${quantity}x ${productName}`,
        image,
        actionText: 'Xem giỏ hàng',
        actionLink: '/cart',
        duration: 4500,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showCartSuccess }}>
      {children}

      {/* Floating Toasts Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999, maxWidth: '420px', width: '100%', pointerEvents: 'none' }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast show shadow-lg border-0 rounded-4 mb-3 overflow-hidden bg-white text-dark animate-slide-in"
            style={{
              pointerEvents: 'auto',
              borderLeft:
                toast.type === 'cart' || toast.type === 'success'
                  ? '5px solid #198754'
                  : toast.type === 'danger'
                  ? '5px solid #dc3545'
                  : '5px solid #0d6efd',
              transition: 'all 0.3s ease',
            }}
          >
            <div className="p-3 d-flex align-items-start gap-3">
              {/* Icon / Image */}
              {toast.image ? (
                <img
                  src={toast.image.startsWith('http') ? toast.image : `/img/Hinh/${toast.image}`}
                  alt=""
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  className="rounded-3 border flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/img/logo2.png';
                  }}
                />
              ) : toast.type === 'cart' ? (
                <div className="rounded-circle bg-success-subtle p-2 text-success flex-shrink-0">
                  <ShoppingCart size={22} />
                </div>
              ) : toast.type === 'success' ? (
                <div className="rounded-circle bg-success-subtle p-2 text-success flex-shrink-0">
                  <CheckCircle2 size={22} />
                </div>
              ) : toast.type === 'danger' ? (
                <div className="rounded-circle bg-danger-subtle p-2 text-danger flex-shrink-0">
                  <AlertCircle size={22} />
                </div>
              ) : (
                <div className="rounded-circle bg-primary-subtle p-2 text-primary flex-shrink-0">
                  <Info size={22} />
                </div>
              )}

              {/* Text Body */}
              <div className="flex-grow-1">
                {toast.title && <h6 className="fw-bold mb-1 small text-dark">{toast.title}</h6>}
                <p className="mb-2 text-muted small lh-sm">{toast.message}</p>
                {toast.actionLink && (
                  <Link
                    to={toast.actionLink}
                    onClick={() => removeToast(toast.id)}
                    className="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold small d-inline-flex align-items-center"
                    style={{ fontSize: '12px' }}
                  >
                    {toast.actionText || 'Chi tiết'} <ArrowRight size={13} className="ms-1" />
                  </Link>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                className="btn-close btn-sm flex-shrink-0"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
