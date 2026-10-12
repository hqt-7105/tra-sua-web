import { Link, NavLink, Outlet } from 'react-router-dom';
import { adminToken, apiUrl } from '../../api/client.js';
import { useOrderEvents } from '../../hooks/useOrderEvents.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * Khung trang quản trị (Sprint 2, đã dựng sẵn).
 * TODO(TV4): nếu chưa có token (adminToken.get()) thì chuyển về /admin/login;
 *            hiện tên + vai trò người đang đăng nhập (GET /api/admin/me) và nút Đăng xuất.
 * TV2 (Observer): luồng /api/admin/events báo đơn mới bằng thông báo nổi ở mọi trang admin.
 */
export default function AdminLayout() {
  const toast = useToast();
  const token = adminToken.get();
  useOrderEvents(token ? apiUrl(`/admin/events?token=${encodeURIComponent(token)}`) : null, (event) => {
    if (event.type === 'ORDER_CREATED') toast.show(`Có đơn mới ${event.orderId}`, { type: 'success' });
  });

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
        <p className="admin__user muted">Chưa đăng nhập (TV4)</p>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
