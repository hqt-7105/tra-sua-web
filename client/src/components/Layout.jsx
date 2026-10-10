import { Link, NavLink, Outlet } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo">
          <span className="logo__cup" aria-hidden>🧋</span>
          Mây <span>Trà Sữa</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          {/* TODO(TV2): hiện số ly trong giỏ bằng useCart() */}
          <NavLink to="/cart" className="nav__cart">
            Giỏ hàng <span className="badge">0</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <strong>Mây Trà Sữa</strong>
          <p>Trà sữa nhà làm, ngọt vừa đủ.</p>
        </div>
        <div>
          <strong>Giờ mở cửa</strong>
          <p>08:00 – 22:00 mỗi ngày</p>
        </div>
        <div>
          <strong>Liên hệ</strong>
          <p>Hotline 0900 000 000</p>
        </div>
      </div>
      <p className="footer__note">Đồ án môn Mẫu thiết kế · Nhóm 5 người</p>
    </footer>
  );
}

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
