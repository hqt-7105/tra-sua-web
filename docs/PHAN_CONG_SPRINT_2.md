# Phân công Sprint 2 — Task thứ hai cho 5 thành viên

> **Thời gian:** Thứ Hai 26/10/2026 → Chủ Nhật 08/11/2026 (2 tuần)
> **Họp giữa sprint:** Chủ Nhật 01/11 · **Demo cuối sprint:** Chủ Nhật 08/11
> **Điều kiện bắt đầu:** Sprint 1 đã merge vào `dev`, `npm test` không có FAIL.

---

## 0. Đã chuẩn bị sẵn cho Sprint 2

- **File khung + hợp đồng + test chấp nhận (đang `todo`)** cho 5 pattern mới:

| Pattern | File khung | Test chấp nhận |
|---|---|---|
| Facade | `server/src/patterns/structural/OrderFacade.js` | `server/tests/facade.test.js` |
| Observer | `server/src/patterns/behavioral/OrderEvents.js` + `server/src/events.js` | `server/tests/observer.test.js` |
| Adapter | `server/src/patterns/structural/PaymentAdapter.js` | `server/tests/adapter.test.js` |
| Proxy | `server/src/patterns/structural/MenuServiceProxy.js` | `server/tests/proxy.test.js` |
| Chain of Responsibility | `server/src/patterns/behavioral/OrderValidation.js` | `server/tests/chain.test.js` |

- **SDK thanh toán GIẢ đã cài xong** (`server/src/integrations/FakeMomoSdk.js`, `FakeVnPaySdk.js`): đóng vai thư viện bên thứ ba, cố ý có giao diện khác nhau để Adapter có việc thật để làm. Không gọi mạng, không cần tài khoản MoMo/VNPay.
- **Băm mật khẩu** (`server/src/utils/password.js`) và 2 tài khoản demo trong `server/src/data/users.json`:
  `admin@may.vn / admin123` (admin), `staff@may.vn / staff123` (nhân viên).
- **Cấu hình nghiệp vụ** `server/src/config.js`: phí ship 15.000đ, giờ mở cửa 08:00–22:00, phương thức thanh toán.
- **Lớp `Order` đã có đủ trường** cho đặt hàng (SĐT, địa chỉ, tạm tính, giảm giá, phí ship, phương thức và trạng thái thanh toán).
- **Route chờ (trả 501 kèm tên người phụ trách)**: `POST /api/orders`, `/api/payments/*`, `/api/admin/*`, các luồng sự kiện SSE.
- **Trang chờ**: `/checkout`, `/payment/mock`, `/admin/login`, `/admin/orders`, `/admin/menu`. Khung admin (thanh bên, điều hướng) đã dựng xong.
- **Đặc tả đầy đủ**: `docs/DAC_TA.md` (use case, quy tắc nghiệp vụ BR, sơ đồ tuần tự đặt hàng). Mã quy tắc như **BR07** trong tài liệu này tra ở đó.

---

## 1. Nguyên tắc chia việc

Giữ đúng khuôn của Sprint 1, mỗi người một lát dọc:

> **1 pattern + test** → **1 phần API** → **1 phần giao diện** → **1 trang `docs/patterns/<ten>.md`**

Mỗi người kết thúc Sprint 2 với **2 pattern do chính mình cài**, thuộc 2 nhóm khác nhau hoặc 2 vai trò khác nhau:

| Thành viên | Sprint 1 | Sprint 2 |
|---|---|---|
| TV1 | Factory Method *(Creational)* | **Facade** *(Structural)* |
| TV2 | Singleton *(Creational)* | **Observer** *(Behavioral)* |
| TV3 | Builder *(Creational)* | **Adapter** *(Structural)* |
| TV4 | Strategy *(Behavioral)* | **Proxy** *(Structural)* |
| TV5 | State *(Behavioral)* | **Chain of Responsibility** *(Behavioral)* |

Sau Sprint 2 dự án có **11 pattern**: 3 Creational, 4 Structural (cùng Decorator mẫu), 4 Behavioral.

---

## 2. Tổng quan 5 task

| | Pattern | Backend / API | Giao diện | Nhánh git |
|---|---|---|---|---|
| **TV1** | Facade | `POST /api/orders` + nối các hệ thống con | Trang Đặt hàng `/checkout` | `feature/tv1-facade` |
| **TV2** | Observer | `events.js` + 2 luồng SSE | Tự cập nhật trang theo dõi đơn + admin, toast | `feature/tv2-observer` |
| **TV3** | Adapter | `/api/payments/methods`, `/api/payments/confirm` | Chọn phương thức thanh toán + cổng thanh toán giả | `feature/tv3-adapter` |
| **TV4** | Proxy | Đăng nhập, phân quyền, `/api/admin/drinks`, `/toppings`, nhật ký | Đăng nhập admin + quản lý menu | `feature/tv4-proxy` |
| **TV5** | Chain of Responsibility | `/api/admin/orders` (xem, đổi trạng thái) | Quản lý đơn hàng trong admin | `feature/tv5-chain` |

Ước lượng mỗi task: **12–16 giờ** trong 2 tuần.

---

## 3. Chi tiết từng task

### Task 2.1 — TV1: Facade + Đặt hàng

**Pattern:**
- [ ] Cài `OrderFacade.placeOrder()` đúng **7 bước theo thứ tự** ghi trong file khung (UC06 trong đặc tả).
- [ ] Facade chỉ **điều phối**, không tự tính giảm giá, không tự gọi SDK, không tự kiểm tra số điện thoại.
- [ ] Bỏ `todo` trong `server/tests/facade.test.js`, tất cả PASS. Test dùng hệ thống con giả nên **làm được ngay ngày đầu**, không chờ ai.

**API:**
- [ ] Tạo `server/src/services/orderFacadeInstance.js` khởi tạo Facade với hệ thống con thật:
  `buildOrderValidationChain` (TV5), `createItem` dùng `OrderItemBuilder` + `createDrinkFromData` (Sprint 1), `voucherService` (TV4 Sprint 1), `createPaymentGateway` (TV3), `orderRepository` (TV5 Sprint 1), `orderEvents` (TV2), `config`.
- [ ] Cài `POST /api/orders` trong `server/src/routes/order.routes.js`: route **chỉ** gọi `facade.placeOrder(req.body)` và trả `201`.
- [ ] Viết ít nhất 3 test API: đặt COD thành công, sai số điện thoại trả 400 kèm `field`, mã giảm giá không tồn tại trả 404.

**Giao diện:** `client/src/pages/Checkout.jsx`
- [ ] Form họ tên, SĐT, địa chỉ, ghi chú; tóm tắt đơn từ `useCart()`, mã giảm giá đã áp ở giỏ, phí ship, tổng.
- [ ] Gọi `POST /api/orders` một lần. Lỗi có `field` thì hiện ngay dưới ô đó.
- [ ] Thành công: `cart.clear()`; có `payment.redirectUrl` thì chuyển sang cổng thanh toán, không có thì sang `/orders/:id`.
- [ ] Gắn `PaymentMethodPicker` của TV3 vào form.

**Việc trưởng nhóm:** điều phối tích hợp ở tuần 2 (Facade là nơi các pattern gặp nhau), chốt kịch bản demo 08/11.

**Phụ thuộc:** unit test không phụ thuộc ai. Bước nối hệ thống con thật cần TV2, TV3, TV5 merge trước **Thứ Tư 04/11**.

---

### Task 2.2 — TV2: Observer + Cập nhật thời gian thực

**Pattern (ưu tiên số 1, tạo PR `OrderSubject` trước Thứ Tư 28/10):**
TV1, TV3, TV5 đều gọi `orderEvents.notify()`. Khi `notify()` chưa cài thì gọi sẽ báo lỗi, nên phần này phải xong sớm.
- [ ] Cài `OrderSubject`, `OrderLogObserver`, `CustomerStreamObserver`, `AdminFeedObserver` trong `server/src/patterns/behavioral/OrderEvents.js`.
- [ ] Bỏ comment 3 dòng `attach` trong `server/src/events.js`.
- [ ] Bỏ `todo` trong `server/tests/observer.test.js`, tất cả PASS.

**API:**
- [ ] Cài `GET /api/orders/:id/events` (khách) và `GET /api/admin/events` (admin), dạng Server-Sent Events. Hướng dẫn có sẵn trong comment của route.
- [ ] Gửi một dòng `: ping` mỗi 25 giây để kết nối không bị đóng; gỡ client khi `req.on('close')`.

**Giao diện:**
- [ ] Cài hook `client/src/hooks/useOrderEvents.js` theo hợp đồng trong file.
- [ ] `OrderTracking.jsx`: có sự kiện thì cập nhật thanh tiến trình, không cần tải lại trang.
- [ ] Tạo component `Toast` dùng chung: hiện ở trang theo dõi đơn ("Đơn của bạn đang được pha chế") và trang admin ("Có đơn mới DH005").
- [ ] `AdminOrders.jsx`: đơn mới tự thêm vào đầu bảng (phối hợp với TV5).

**Phụ thuộc:** không. Nên làm thử với `curl -N http://localhost:3001/api/orders/DH001/events`.

---

### Task 2.3 — TV3: Adapter + Thanh toán

**Pattern:**
- [ ] Cài `CodAdapter`, `MomoAdapter`, `VnPayAdapter`, `createPaymentGateway()` trong `server/src/patterns/structural/PaymentAdapter.js`.
- [ ] **Không sửa** 2 file SDK giả. Mọi khác biệt (async/sync, mã lỗi số/chuỗi, tiền ×100, ném lỗi/trả mã) phải được Adapter che đi.
- [ ] Bỏ `todo` trong `server/tests/adapter.test.js`, tất cả PASS.

**API:** `server/src/routes/payment.routes.js`
- [ ] `GET /api/payments/methods` lấy từ `config.paymentMethods`.
- [ ] `POST /api/payments/confirm`: verify qua Adapter → cập nhật `paymentStatus` (BR16, BR17) → lưu → `orderEvents.notify({ type: 'PAYMENT_UPDATED', ... })`.
- [ ] Ít nhất 3 test API: thanh toán thành công thành `PAID`, khách hủy làm đơn bị `CANCELLED`, chữ ký sai trả 400.

**Giao diện:**
- [ ] `client/src/components/PaymentMethodPicker.jsx` (TV1 gắn vào trang Đặt hàng).
- [ ] `client/src/pages/PaymentMock.jsx`: màn hình cổng giả hiện mã đơn và số tiền, có 2 nút "Thanh toán thành công" / "Hủy giao dịch", xong thì về `/orders/:id`. Hướng dẫn tham số có sẵn trong trang.

**Phụ thuộc:** `orderRepository` (Sprint 1) và `orderEvents` (TV2) cho route `confirm`.

---

### Task 2.4 — TV4: Proxy + Đăng nhập & quản lý menu

**Pattern:**
- [ ] Cài `MenuServiceProxy` (8 hàm) trong `server/src/patterns/structural/MenuServiceProxy.js`.
- [ ] Tạo `server/src/services/menuService.js` (RealSubject): đọc/ghi món và topping qua `menuRepository`. Thêm vào repository các hàm `createDrink`, `updateDrink`, `createTopping`, `updateTopping`, lưu trong bộ nhớ là đủ.
- [ ] Bỏ `todo` trong `server/tests/proxy.test.js`, tất cả PASS.

**Đăng nhập & phân quyền:**
- [ ] Cài `server/src/services/authService.js` theo hợp đồng (token ngẫu nhiên, hết hạn sau `config.sessionHours`).
- [ ] **Thay bản tạm** trong `server/src/middlewares/auth.js` bằng kiểm tra token thật (401/403). Đây là việc **bắt buộc trước demo**: hiện tại mọi request vào `/api/admin` đều được coi là admin.
- [ ] Cài `POST /api/admin/login`, `/logout`, `GET /me`.

**API menu:** `server/src/routes/admin.routes.js`
- [ ] Route `/api/admin/drinks`, `/toppings`, `/audit-log` gọi qua `new MenuServiceProxy(menuService, req.user, auditLog)`, **không** gọi thẳng `menuService`.
- [ ] Kiểm tra dữ liệu (BR19): tên không rỗng, giá là số nguyên ≥ 0, danh mục tồn tại.
- [ ] Ít nhất 3 test API: staff sửa món bị 403, admin sửa được, chưa đăng nhập bị 401.

**Giao diện:**
- [ ] `client/src/pages/admin/AdminLogin.jsx`: form đăng nhập, lưu token bằng `adminToken.set()`.
- [ ] `AdminLayout.jsx`: chưa có token thì về `/admin/login`; hiện tên, vai trò, nút Đăng xuất.
- [ ] `client/src/pages/admin/AdminMenu.jsx`: bảng món + form thêm/sửa + "Ngừng bán".
- [ ] *(Nếu kịp)* tab Topping và tab Nhật ký.

**Phụ thuộc:** không.

---

### Task 2.5 — TV5: Chain of Responsibility + Quản lý đơn

**Pattern:**
- [ ] Cài 5 handler và `buildOrderValidationChain()` trong `server/src/patterns/behavioral/OrderValidation.js` theo đúng thứ tự và quy tắc BR10–BR14.
- [ ] Mỗi handler chỉ kiểm tra **một** việc, sai thì `throw new ValidationError(field, message)` với thông báo tiếng Việt dễ hiểu.
- [ ] Bỏ `todo` trong `server/tests/chain.test.js`, tất cả PASS.

**API:** `server/src/routes/admin.routes.js`
- [ ] `GET /api/admin/orders?status=...` qua `orderRepository.findAll()`.
- [ ] `PATCH /api/admin/orders/:id/status` dùng lại State của Sprint 1; thành công thì `orderEvents.notify({ type: 'STATUS_CHANGED', from, to, ... })`. Thêm `notify` vào cả route `PATCH /api/orders/:id/status` của Sprint 1.
- [ ] Ít nhất 3 test API: lọc theo trạng thái, đổi trạng thái hợp lệ, chuyển sai bị 409.

**Giao diện:** `client/src/pages/admin/AdminOrders.jsx`
- [ ] Bảng đơn, tab lọc theo trạng thái, nút theo `allowedActions`, xem chi tiết đơn và lịch sử trạng thái.

**Phụ thuộc:** đăng nhập (TV4). Trong lúc chờ, middleware tạm cho qua nên vẫn làm được.

---

## 4. Tiêu chí hoàn thành chung

Giống Sprint 1:

1. `npm test` không có FAIL; test của mình đã bỏ `todo` và có thêm test API như yêu cầu.
2. Trang của mình chạy được, đã xóa `TaskNotice` của mình.
3. File pattern có khối chú thích GoF đầu file.
4. Có `docs/patterns/<ten-pattern>.md` theo mẫu `decorator.md`, **bắt buộc có sơ đồ lớp**. Riêng Facade thêm sơ đồ tuần tự, xem `docs/DAC_TA.md` mục 7.3.
5. PR vào `dev`, có ít nhất 1 người review. Review chéo Sprint 2 đảo chiều: TV1 → TV5 → TV4 → TV3 → TV2 → TV1.

---

## 5. Lịch trong sprint

| Ngày | Việc |
|---|---|
| T2 26/10 | Kiểm tra Sprint 1 đã merge đủ, `npm test` sạch. Mỗi người tạo nhánh Sprint 2 |
| T2–T4 26–28/10 | Làm **pattern + test** trước. **TV2 merge `OrderSubject` trước T4 28/10** |
| CN 01/11 | Họp giữa sprint: demo test pattern PASS; TV4 demo đăng nhập + 403 |
| T2–T4 02–04/11 | Làm API + giao diện. **TV2, TV3, TV5 merge trước T4 04/11** để TV1 nối Facade |
| T5–T7 05–07/11 | TV1 tích hợp, cả nhóm chạy thử kịch bản demo, sửa lỗi |
| CN 08/11 | Demo Sprint 2 (kịch bản dưới), merge `dev` → `main` |

## 6. Kịch bản demo 08/11

1. **Khách, thanh toán COD:** Menu → tùy chỉnh món → giỏ → áp `MAY10` → Đặt hàng → trang theo dõi đơn.
2. **Nhân viên:** đăng nhập `staff@may.vn` → thấy đơn mới hiện ngay (Observer) → bấm "Xác nhận". Trang của khách tự chuyển sang "Đang pha chế" mà không phải tải lại.
3. **Khách, thanh toán MoMo:** cổng giả → "Thanh toán thành công" → đơn hiện "Đã thanh toán".
4. **Khách, thanh toán VNPay:** cổng giả → "Hủy giao dịch" → đơn tự hủy.
5. **Đặt sai dữ liệu:** số điện thoại sai → lỗi hiện đúng ô (Chain of Responsibility).
6. **Phân quyền:** nhân viên sửa giá món bị từ chối (403); admin sửa được, nhật ký ghi lại (Proxy).

## 7. Sau Sprint 2

Sprint 3 (09/11–15/11) là sprint hoàn thiện: chuyển dữ liệu sang CSDL thật, kiểm thử tổng, báo cáo, slide. Đề xuất phân công ở `docs/KE_HOACH.md` mục 5, chốt tại buổi demo 08/11.
