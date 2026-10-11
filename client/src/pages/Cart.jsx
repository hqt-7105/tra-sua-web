import { Link } from 'react-router-dom';
import TaskNotice from '../components/TaskNotice.jsx';
import VoucherInput from '../components/VoucherInput.jsx';

export default function Cart() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Giỏ hàng</h1>

        <TaskNotice owner="TV1" task="Danh sách món trong giỏ" pattern="dùng Singleton của TV2">
          <ul>
            <li>Lấy món từ <code>useCart()</code> / <code>CartStore.getInstance()</code></li>
            <li>Tăng/giảm số lượng, xóa món, hiện tạm tính; giỏ trống thì hiện nút về Menu</li>
          </ul>
        </TaskNotice>

        {/* Tạm dùng tạm tính giả 100.000đ để thử mã; TV1 thay bằng tạm tính của giỏ thật. */}
        <VoucherInput subtotal={100000} />

        <div className="cart__actions">
          <Link to="/menu" className="btn btn--ghost">Chọn thêm món</Link>
          <Link to="/checkout" className="btn">Tiến hành đặt hàng</Link>
        </div>
      </div>
    </section>
  );
}
