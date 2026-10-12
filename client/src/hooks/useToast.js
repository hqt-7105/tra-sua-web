import { createContext, useContext } from 'react';

/**
 * Hiện thông báo nổi từ bất kỳ trang nào — TV2. Provider nằm ở components/Toast.jsx
 * và đã bọc toàn bộ App trong main.jsx.
 *
 *   const toast = useToast();
 *   toast.show('Đơn của bạn đang được pha chế');                  // tự ẩn sau 3 giây
 *   toast.show('Có đơn mới DH005', { type: 'success' });           // type: info | success | error
 *   toast.show('Mất kết nối', { type: 'error', duration: 5000 });
 */
export const ToastContext = createContext(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast() phải dùng bên trong <ToastProvider>');
  return toast;
}
