import { Link } from 'react-router-dom';
import TaskNotice from '../../components/TaskNotice.jsx';

export default function AdminLogin() {
  return (
    <div className="mock-gateway">
      <div className="mock-gateway__card">
        <Link to="/" className="logo"><span aria-hidden>🧋</span> Mây <span>Admin</span></Link>
        <h1 style={{ marginTop: 16 }}>Đăng nhập quản trị</h1>

        <TaskNotice sprint={2} owner="TV4" task="Đăng nhập" pattern="(phục vụ Proxy)">
          <ul>
            <li>Form email + mật khẩu → <code>POST /api/admin/login</code></li>
            <li>Thành công: <code>adminToken.set(token)</code> (có sẵn trong <code>api/client.js</code>) rồi chuyển tới <code>/admin/orders</code></li>
            <li>Sai: hiện &quot;Email hoặc mật khẩu không đúng&quot;, không nói rõ sai phần nào</li>
            <li>Tài khoản demo: <code>admin@may.vn / admin123</code>, <code>staff@may.vn / staff123</code></li>
          </ul>
        </TaskNotice>
      </div>
    </div>
  );
}
