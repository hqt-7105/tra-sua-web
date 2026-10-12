import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCart } from '../store/useCart.js';

/**
 * Header — B2 (TV2): màn hình hẹp (< 768px) gom điều hướng vào menu hamburger; giỏ hàng
 * luôn hiện. Menu đóng khi chuyển trang hoặc bấm Esc (trả focus về nút), mở/đóng được bằng bàn phím.
 */
function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo">
          <span className="logo__cup" aria-hidden>🧋</span>
          Mây <span>Trà Sữa</span>
        </Link>
        <nav id="main-nav" className={open ? 'nav nav--open' : 'nav'} aria-label="Điều hướng chính">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/orders/lookup">Tra cứu đơn</NavLink>
        </nav>
        <div className="header__actions">
          <NavLink to="/cart" className="header__cart" aria-label={`Giỏ hàng, ${count} ly`}>
            Giỏ hàng <span className="badge">{count}</span>
          </NavLink>
          <button
            ref={toggleRef}
            type="button"
            className={open ? 'nav-toggle nav-toggle--open' : 'nav-toggle'}
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav-toggle__bar" aria-hidden />
            <span className="nav-toggle__bar" aria-hidden />
            <span className="nav-toggle__bar" aria-hidden />
          </button>
        </div>
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
          <p>
            <Link to="/orders/lookup" className="footer__link">Tra cứu đơn hàng</Link>
          </p>
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
