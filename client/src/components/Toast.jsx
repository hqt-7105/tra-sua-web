import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext } from '../hooks/useToast.js';

/**
 * Thông báo nổi dùng chung — TV2. Bọc App một lần (main.jsx), các trang gọi useToast().
 *
 *   <ToastProvider><App /></ToastProvider>
 *
 *   const toast = useToast();
 *   toast.show('Đã thêm vào giỏ', { type: 'success' });
 *
 * Tự ẩn sau TOAST_DURATION_MS, giữ tối đa MAX_TOASTS thông báo, có nút đóng.
 * Vùng thông báo dùng aria-live để trình đọc màn hình đọc lên.
 */
export const TOAST_DURATION_MS = 3000;
const MAX_TOASTS = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, { type = 'info', duration = TOAST_DURATION_MS } = {}) => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-(MAX_TOASTS - 1)), { id, message, type }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast__message">{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Đóng thông báo"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
