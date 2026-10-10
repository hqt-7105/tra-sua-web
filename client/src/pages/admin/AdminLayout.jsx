import { Link, NavLink, Outlet } from 'react-router-dom';

/**
 * Khung trang quản trị (Sprint 2, đã dựng sẵn).
 * TODO(TV4): nếu chưa có token (adminToken.get()) thì chuyển về /admin/login;
 *            hiện tên + vai trò người đang đăng nhập (GET /api/admin/me) và nút Đăng xuất.
 * TODO(TV2): hiện thông báo nổi (toast) khi có đơn mới từ luồng /api/admin/events.
 */
export default function AdminLayout() {
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
