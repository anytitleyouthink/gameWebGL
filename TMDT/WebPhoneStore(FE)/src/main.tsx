import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// FIX: Ngăn chặn Unity WebGL (Emscripten) chặn sự kiện gõ phím trên các trường input, textarea, form thanh toán
if (typeof window !== 'undefined') {
  // 1. Bảo vệ phương thức preventDefault() khi đang gõ vào input/textarea/select
  const originalPreventDefault = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function () {
    const type = this.type;
    if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
      const activeEl = document.activeElement as HTMLElement | null;
      const targetEl = this.target as HTMLElement | null;
      const isInput =
        (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.tagName === 'SELECT' || targetEl.isContentEditable)) ||
        (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable));

      if (isInput) {
        // Cho phép gõ chữ bình thường vào trường form (không để Unity hủy bỏ keystroke)
        return;
      }
    }
    return originalPreventDefault.apply(this, arguments as any);
  };

  // 2. Chặn lan truyền (stopPropagation) sự kiện phím từ ô input lên window/document để Unity không nuốt phím
  const keyEvents = ['keydown', 'keyup', 'keypress'];
  keyEvents.forEach((evt) => {
    // Bubble phase trên document
    document.addEventListener(
      evt,
      (e) => {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          e.stopPropagation();
        }
      },
      false
    );

    // Capture phase trên window nếu có listener chặn trước
    window.addEventListener(
      evt,
      (e) => {
        const target = e.target as HTMLElement | null;
        const active = document.activeElement as HTMLElement | null;
        const isInput =
          (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) ||
          (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable));

        if (isInput) {
          // Đảm bảo không bị hủy bỏ
          if (e.defaultPrevented) {
            // Un-prevent if possible
          }
        }
      },
      true
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

