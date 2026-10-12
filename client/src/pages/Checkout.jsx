import { useState } from 'react';
import { Link } from 'react-router-dom';
import TaskNotice from '../components/TaskNotice.jsx';
import PaymentMethodPicker from '../components/PaymentMethodPicker.jsx';

/** Trang đặt hàng — Sprint 2 */
export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('COD');

  return (
    <section className="section">
      <div className="container narrow">
        <Link to="/cart" className="link">← Quay lại giỏ hàng</Link>
        <h1 style={{ marginTop: 12 }}>Đặt hàng</h1>

        <TaskNotice sprint={2} owner="TV1" task="Form đặt hàng + gửi đơn" pattern="Facade">
          <ul>
            <li>Form: họ tên, số điện thoại, địa chỉ, ghi chú; tóm tắt đơn lấy từ <code>useCart()</code> và mã giảm giá đã áp ở giỏ</li>
            <li>Nút &quot;Đặt hàng&quot; gọi <strong>một</strong> API <code>POST /api/orders</code></li>
            <li>Lỗi 400 có <code>field</code> → hiện lỗi ngay dưới ô tương ứng; lỗi khác → thông báo chung</li>
            <li>Thành công: xóa giỏ; nếu có <code>payment.redirectUrl</code> thì chuyển sang đó, không thì sang <code>/orders/:id</code></li>
          </ul>
        </TaskNotice>

        <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
      </div>
    </section>
  );
}
