import { useParams } from 'react-router-dom';
import TaskNotice from '../components/TaskNotice.jsx';

const STEPS = ['Chờ xác nhận', 'Đang pha chế', 'Đang giao', 'Hoàn thành'];

export default function OrderTracking() {
  const { id } = useParams();

  return (
    <section className="section">
      <div className="container narrow">
        <h1>Đơn hàng #{id}</h1>

        {/* Thanh tiến trình tĩnh để minh họa; TV5 nối với dữ liệu thật */}
        <ol className="steps">
          {STEPS.map((label, i) => (
            <li key={label} className={i === 0 ? 'steps__item active' : 'steps__item'}>
              <span className="steps__dot">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <TaskNotice owner="TV5" task="Theo dõi trạng thái đơn" pattern="State">
          <ul>
            <li>Gọi <code>GET /api/orders/:id</code>, tô sáng bước theo <code>status</code>; đơn bị hủy thì hiện nhãn &quot;Đã hủy&quot;</li>
            <li>Nút thử nghiệm &quot;Chuyển bước tiếp&quot; / &quot;Hủy đơn&quot; gọi <code>PATCH /api/orders/:id/status</code>, chỉ hiện nút có trong <code>allowedActions</code></li>
            <li>Thử với đơn mẫu: <code>/orders/DH001</code></li>
          </ul>
        </TaskNotice>

        <TaskNotice sprint={2} owner="TV2" task="Tự cập nhật khi đơn đổi trạng thái (Sprint 2)" pattern="Observer">
          <ul>
            <li>Dùng <code>useOrderEvents(`/api/orders/${'{id}'}/events`, ...)</code>: có sự kiện thì cập nhật thanh tiến trình, không cần tải lại trang</li>
            <li>Hiện toast &quot;Đơn của bạn đang được pha chế&quot;... theo trạng thái mới, và trạng thái thanh toán khi cổng báo về</li>
          </ul>
        </TaskNotice>
      </div>
    </section>
  );
}
