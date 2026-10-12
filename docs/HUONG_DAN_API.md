# Hướng dẫn gọi thử API

Gọi thử API ngay trong VS Code, không phải gõ lệnh `curl`. Hợp đồng chi tiết của từng endpoint nằm ở `docs/API.md`.

## 1. Cài đặt (một lần)

1. VS Code → Extensions (`Ctrl+Shift+X`) → tìm **REST Client** (tác giả Huachao Mao) → Install.
2. Chạy dự án: `npm run dev` ở thư mục gốc. API ở `http://localhost:3001/api` (kiểm tra: mở `/api/health`).

## 2. Gọi thử

1. Mở `docs/api.http`.
2. Phía trên mỗi khối có dòng chữ nhỏ **Send Request**: bấm vào, kết quả hiện ở khung bên phải (mã trạng thái, header, JSON).
3. Các khối ngăn nhau bằng `###`. Dòng bắt đầu bằng `#` là chú thích; nhãn `S0`/`S1`/`S2` cho biết endpoint thuộc sprint nào.
4. Biến dùng chung khai báo ở đầu file: `@host = http://localhost:3001/api`. Đổi cổng thì sửa một chỗ này.

Mẹo: `Ctrl+Alt+R` gửi khối đang đặt con trỏ; `Ctrl+Alt+E` đổi môi trường nếu sau này nhóm thêm `rest-client.environmentVariables`.

## 3. Lấy token admin

Các route `/admin/*` (trừ đăng nhập) cần header `Authorization: Bearer <token>`.

1. Bấm **Send Request** ở khối `# @name loginAdmin` (admin) hoặc `# @name loginStaff` (nhân viên).
2. Token trong response được lưu tự động vào biến `{{adminToken}}` / `{{staffToken}}` nhờ dòng
   `@adminToken = {{loginAdmin.response.body.token}}`.
3. Các khối phía dưới đã có sẵn `Authorization: Bearer {{adminToken}}`, chỉ việc bấm gửi.

Tài khoản demo: `admin@may.vn / admin123` (toàn quyền), `staff@may.vn / staff123` (xử lý đơn, chỉ xem menu).
Token hết hạn sau 8 giờ hoặc khi khởi động lại server (phiên lưu trong bộ nhớ): đăng nhập lại là xong.
Đăng nhập sai 5 lần trong 1 phút sẽ bị `429`, chờ 1 phút.

## 4. Lưu ý

- Dữ liệu (đơn hàng, sửa menu) lưu trong bộ nhớ: khởi động lại server là về dữ liệu mẫu (DH001–DH003).
- Đặt đơn ngoài 08:00–22:00 bị từ chối (`field: "store"`). Muốn thử giờ khác: `FAKE_HOUR=10 npm run dev`
  (PowerShell: `$env:FAKE_HOUR=10; npm run dev`).
- Luồng sự kiện SSE (`/events`) không kết thúc nên REST Client sẽ chờ; xem trực tiếp bằng
  `curl -N http://localhost:3001/api/orders/DH001/events` rồi đổi trạng thái đơn ở khung khác.
- Xác nhận thanh toán (`/payments/confirm`) cần chữ ký thật do SDK giả tạo: dễ nhất là đặt đơn MoMo/VNPay
  trên giao diện rồi bấm nút ở trang `/payment/mock`.
