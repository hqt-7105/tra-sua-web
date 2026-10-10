import { Link } from 'react-router-dom';
import TaskNotice from '../components/TaskNotice.jsx';

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

        <TaskNotice owner="TV4" task="Ô nhập mã giảm giá (VoucherInput)" pattern="Strategy">
          <ul>
            <li>Component <code>src/components/VoucherInput.jsx</code> nhận <code>subtotal</code>, gọi <code>POST /api/vouchers/validate</code></li>
            <li>Hiện số tiền giảm và tổng mới, hoặc thông báo lỗi (hết hạn, chưa đủ đơn tối thiểu)</li>
          </ul>
        </TaskNotice>

        <div className="cart__actions">
          <Link to="/menu" className="btn btn--ghost">Chọn thêm món</Link>
          <Link to="/checkout" className="btn">Tiến hành đặt hàng</Link>
        </div>
      </div>
    </section>
  );
}
