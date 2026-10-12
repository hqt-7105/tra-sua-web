import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { adminToken, api } from '../../api/client.js';

/**
 * Đăng nhập quản trị — TV4 (UC09). Thành công: lưu token bằng adminToken.set() rồi
 * chuyển tới trang đang muốn vào (mặc định /admin/orders).
 * Sai thông tin: hiện đúng thông báo của server, không nói rõ sai email hay mật khẩu (BR21).
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const target = location.state?.from || '/admin/orders';
  if (adminToken.get()) return <Navigate to={target} replace />;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { token } = await api.post('/admin/login', form);
      adminToken.set(token);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mock-gateway">
      <div className="mock-gateway__card login">
        <Link to="/" className="logo"><span aria-hidden>🧋</span> Mây <span>Admin</span></Link>
        <h1 className="login__title">Đăng nhập quản trị</h1>
        {location.state?.expired && (
          <p className="error" role="alert">Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.</p>
        )}

        <form className="login__form" onSubmit={submit} noValidate>
          <div>
            <label htmlFor="login-email" className="field__label">Email</label>
            <input
              id="login-email"
              type="email"
              className="input input--block"
              autoComplete="username"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="field__label">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              className="input input--block"
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
              required
            />
          </div>
          {error && <p className="field__error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--lg" disabled={busy}>
            {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="muted login__hint">
          Tài khoản demo: <code>admin@may.vn / admin123</code> (quản trị) · <code>staff@may.vn / staff123</code> (nhân viên)
        </p>
      </div>
    </div>
  );
}
