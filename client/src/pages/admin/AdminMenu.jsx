import TaskNotice from '../../components/TaskNotice.jsx';

export default function AdminMenu() {
  return (
    <>
      <h1>Menu &amp; topping</h1>
      <TaskNotice sprint={2} owner="TV4" task="Quản lý món và topping" pattern="Proxy">
        <ul>
          <li>Bảng món: tên, danh mục, giá, bán chạy, trạng thái bán; gọi <code>GET /api/admin/drinks?includeInactive=true</code></li>
          <li>Thêm / sửa món qua form, &quot;Ngừng bán&quot; thay cho xóa hẳn; làm tương tự cho topping</li>
          <li>Đăng nhập bằng <code>staff@may.vn</code>: vẫn xem được, bấm sửa thì hiện thông báo 403 từ Proxy</li>
          <li>Tab &quot;Nhật ký&quot; (chỉ admin): <code>GET /api/admin/audit-log</code></li>
        </ul>
      </TaskNotice>
    </>
  );
}
