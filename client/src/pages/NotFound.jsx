import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container narrow center">
        <h1>Không tìm thấy trang</h1>
        <p className="muted">Có thể ly trà sữa này đã hết hàng 🧋</p>
        <Link to="/" className="btn">Về trang chủ</Link>
      </div>
    </section>
  );
}
