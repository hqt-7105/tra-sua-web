import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ADMIN_LOGOUT_EVENT, adminToken, api, apiUrl } from '../../api/client.js';
import { useOrderEvents } from '../../hooks/useOrderEvents.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * Khung trang quản trị.
 * TV4: chưa có token thì về /admin/login; hiện tên + vai trò (GET /api/admin/me) và nút
 *      Đăng xuất; API trả 401 (hết phiên) thì quay về trang đăng nhập (UC09).
 *      Trang con đọc người đang đăng nhập bằng useOutletContext().user.
 * TV2 (Observer): luồng /api/admin/events báo đơn mới bằng thông báo nổi ở mọi trang admin;
 *      trang con đăng ký nhận sự kiện qua useOutletContext().onOrderEvent(fn).
 */
const ROLE_LABELS = { admin: 'Quản trị', staff: 'Nhân viên' };

export default function AdminLayout() {
  const location = useLocation();
  const toast = useToast();
  const [token, setToken] = useState(() => adminToken.get());
  /** Vì sao rời khu admin: null (chưa đăng nhập) | 'expired' (hết phiên) | 'logout' (tự đăng xuất). */
  const [exitReason, setExitReason] = useState(null);
  const [user, setUser] = useState(null);
  const listeners = useRef(new Set());

  // API trả 401 ở bất kỳ trang admin nào → client.js xóa token và phát sự kiện này.
  useEffect(() => {
    const onExpired = () => {
      setExitReason((reason) => reason ?? 'expired');
      setToken(null);
    };
    window.addEventListener(ADMIN_LOGOUT_EVENT, onExpired);
    return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, onExpired);
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    api
      .get('/admin/me')
      .then((me) => !cancelled && setUser(me))
      .catch(() => {
        /* 401 đã được xử lý qua ADMIN_LOGOUT_EVENT */
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useOrderEvents(token ? apiUrl(`/admin/events?token=${encodeURIComponent(token)}`) : null, (event) => {
    if (event.type === 'ORDER_CREATED') toast.show(`Có đơn mới ${event.orderId}`, { type: 'success' });
    listeners.current.forEach((listener) => listener(event));
  });

  /** Trang con nhận sự kiện đơn hàng: useEffect(() => onOrderEvent(fn), [...]) — trả hàm hủy đăng ký. */
  const onOrderEvent = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  if (!token) {
    // Tự đăng xuất thì không nhớ trang cũ; hết phiên thì đăng nhập lại xong quay về đúng trang.
    const state = exitReason === 'logout' ? null : { from: location.pathname, expired: exitReason === 'expired' };
    return <Navigate to="/admin/login" replace state={state} />;
  }

  const logout = async () => {
    setExitReason('logout');
    try {
      await api.post('/admin/logout');
    } catch {
      /* phiên đã hết hạn thì vẫn coi như đã đăng xuất */
    }
    adminToken.clear();
    setToken(null);
  };

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link to="/" className="logo admin__logo">
          <span aria-hidden>🧋</span> Mây <span>Admin</span>
        </Link>
        <nav className="admin__nav">
          <NavLink to="/admin/orders">Đơn hàng</NavLink>
          <NavLink to="/admin/menu">Menu &amp; topping</NavLink>
        </nav>
        <div className="admin__user">
          {user ? (
            <span>
              <strong>{user.name}</strong> · {ROLE_LABELS[user.role] ?? user.role}
            </span>
          ) : (
            <span>Đang tải...</span>
          )}
          <button type="button" className="btn btn--sm admin__logout" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet context={{ user, onOrderEvent }} />
      </main>
    </div>
  );
}
