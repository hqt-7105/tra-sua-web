import TaskNotice from '../../components/TaskNotice.jsx';

export default function AdminOrders() {
  return (
    <>
      <h1>Đơn hàng</h1>
      <TaskNotice sprint={2} owner="TV5" task="Quản lý đơn hàng" pattern="State + Chain of Responsibility">
        <ul>
          <li>Bảng đơn: mã, khách, SĐT, tổng tiền, thanh toán, trạng thái, giờ đặt; gọi <code>GET /api/admin/orders</code></li>
          <li>Lọc theo trạng thái bằng các tab: Tất cả / Chờ xác nhận / Đang pha chế / Đang giao / Hoàn thành / Đã hủy</li>
          <li>Mỗi dòng chỉ hiện nút có trong <code>allowedActions</code>: &quot;Xác nhận&quot;, &quot;Giao hàng&quot;, &quot;Hoàn thành&quot;, &quot;Hủy&quot; → <code>PATCH /api/admin/orders/:id/status</code></li>
          <li>Bấm vào dòng: xem chi tiết món, ghi chú, lịch sử trạng thái</li>
        </ul>
      </TaskNotice>
      <TaskNotice sprint={2} owner="TV2" task="Cập nhật danh sách theo thời gian thực" pattern="Observer">
        <ul>
          <li>Mở luồng <code>/api/admin/events?token=...</code> bằng <code>useOrderEvents</code>; có đơn mới thì thêm vào đầu bảng và hiện toast</li>
        </ul>
      </TaskNotice>
    </>
  );
}
