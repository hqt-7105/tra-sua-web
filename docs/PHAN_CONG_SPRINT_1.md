# Phân công Sprint 1 — Task khởi đầu cho 5 thành viên

> **Thời gian:** Thứ Hai 12/10/2026 → Chủ Nhật 25/10/2026 (2 tuần, nhóm tự chỉnh ngày nếu cần)
> **Họp giữa sprint:** Chủ Nhật 18/10 · **Demo cuối sprint:** Chủ Nhật 25/10

---

## 0. Đã xong ở Sprint 0 (bộ khung chung)

Không ai phải làm lại các phần này, chỉ cần đọc để hiểu:

- Cấu trúc dự án `client/` (React + Vite) và `server/` (Node.js + Express), chạy chung bằng `npm run dev`.
- Dữ liệu mẫu dạng JSON: 4 danh mục, 11 món, 6 topping, tùy chọn size/đường/đá (`server/src/data/`).
- API đã chạy: `GET /api/categories`, `/api/drinks`, `/api/drinks/:id`, `/api/toppings`, `/api/options`.
- Giao diện: landing page cơ bản, trang Menu (lọc theo danh mục, tìm kiếm), trang chi tiết món, các trang chờ có khung ghi tên người phụ trách.
- **Decorator đã cài hoàn chỉnh làm mẫu** (`server/src/patterns/structural/ToppingDecorator.js` + 7 test). Mọi người đọc file này trước để biết cách viết chú thích, cách viết test.
- Mỗi pattern của Sprint 1 đã có **file khung + hợp đồng (contract) + test chấp nhận viết sẵn** ở trạng thái `todo`. Làm xong thì xóa `{ todo: ... }` và test phải PASS.

---

## 1. Nguyên tắc chia việc

Ở sprint đầu, **mỗi người làm một "lát dọc" có cùng khuôn**:

> **1 pattern + test** → **1 phần API hoặc logic** → **1 phần giao diện** → **1 trang tài liệu giải thích pattern**

Lý do:
- Khối lượng ngang nhau, ai cũng chạm cả frontend lẫn backend nên không ai bị "chờ" người khác.
- Khi bảo vệ đồ án, **mỗi thành viên tự giải thích được ít nhất một pattern do chính mình cài**.
- Từ Sprint 2 có thể quay lại phân vai chuyên sâu (UI/UX, backend, QA) như kế hoạch tổng.

Ba nhóm pattern đều được phủ ngay trong Sprint 1:

| Nhóm | Pattern | Người phụ trách |
|---|---|---|
| Creational | Factory Method | TV1 |
| Creational | Singleton | TV2 |
| Creational | Builder | TV3 |
| Structural | Decorator | ✅ Đã xong (mẫu) |
| Behavioral | Strategy | TV4 |
| Behavioral | State | TV5 |

---

## 2. Tổng quan 5 task

| | Pattern | Backend / logic | Giao diện | Nhánh git |
|---|---|---|---|---|
| **TV1** (trưởng nhóm) | Factory Method | Refactor API `/drinks` dùng factory | Trang Giỏ hàng | `feature/tv1-factory-method` |
| **TV2** | Singleton | `CartStore` + hook `useCart` | Hoàn thiện Landing page + số ly trên Header | `feature/tv2-singleton-cart` |
| **TV3** | Builder | `POST /api/cart/price` | Form tùy chỉnh món + "Thêm vào giỏ" | `feature/tv3-builder` |
| **TV4** | Strategy | Dữ liệu voucher + `POST /api/vouchers/validate` | Ô nhập mã giảm giá | `feature/tv4-strategy` |
| **TV5** | State | `GET` / `PATCH /api/orders/:id` | Trang theo dõi đơn | `feature/tv5-state` |

Ước lượng mỗi task: **10–14 giờ làm việc** trong 2 tuần.

---

## 3. Chi tiết từng task

### Task 1 — TV1: Factory Method + Trang Giỏ hàng

**Việc riêng của trưởng nhóm (làm ngày đầu tiên, trước khi mọi người bắt đầu):**
- [ ] Tạo repo GitHub từ bộ khung, tạo nhánh `dev`, bật bảo vệ nhánh `main` và `dev` (bắt buộc PR + 1 review).
- [ ] Tạo bảng Kanban (GitHub Projects / Trello) với 5 task này, mời đủ thành viên.

**Pattern:**
- [ ] Tạo 4 lớp sản phẩm trong `server/src/domain/drinks/`: `MilkTea`, `FruitTea`, `Coffee`, `IceBlended` kế thừa `BasicDrink`.
  Mỗi lớp có `getCategoryName()` và `getCustomization()` trả về `{ allowToppings, allowSugar, allowIce }`
  (gợi ý: cà phê không thêm topping, đá xay không chỉnh mức đá).
- [ ] Cài `DrinkCreator` và 4 ConcreteCreator trong `server/src/patterns/creational/DrinkFactory.js`.
  **Không** dùng một hàm switch-case duy nhất (đó là Simple Factory, không phải Factory Method).
- [ ] Bỏ `todo` trong `server/tests/factory.test.js`, tất cả test PASS.

**API:**
- [ ] Sửa `GET /api/drinks` và `GET /api/drinks/:id` trong `server/src/routes/menu.routes.js`: tạo đối tượng qua `createDrinkFromData()`, trả thêm `categoryName` và `customization`. Giữ nguyên các trường cũ để frontend không bị vỡ.

**Giao diện:** `client/src/pages/Cart.jsx`
- [ ] Hiện danh sách món từ `useCart()` (của TV2): mô tả, tùy chọn, đơn giá, số lượng (+/−), nút xóa, tạm tính.
- [ ] Giỏ trống thì hiện lời nhắc và nút về Menu.
- [ ] Đặt component `VoucherInput` của TV4 vào trang khi TV4 merge xong.

**Phụ thuộc:** cần `CartStore` của TV2 cho phần giao diện → làm phần pattern trước.

---

### Task 2 — TV2: Singleton CartStore + Landing page

**Pattern (ưu tiên số 1, tạo PR trước Thứ Tư 14/10 vì TV1 và TV3 cần dùng):**
- [ ] Cài `CartStore` theo hợp đồng ghi trong `client/src/store/cartStore.js`: `getInstance()` luôn trả cùng một đối tượng, gọi `new CartStore()` trực tiếp phải báo lỗi.
- [ ] Lưu giỏ vào `localStorage` (bọc `try/catch`).
- [ ] Bỏ `todo` trong `client/tests/cartStore.test.js`, tất cả test PASS (`npm test -w client`).
- [ ] Tạo hook `client/src/store/useCart.js` dùng `useSyncExternalStore` + `subscribe()`.

**Giao diện:**
- [ ] Header hiện số ly thật trong giỏ (`client/src/components/Layout.jsx`).
- [ ] Hoàn thiện Landing page (`client/src/pages/Home.jsx`) theo Figma: thêm mục Đánh giá khách hàng, mục Cửa hàng (địa chỉ, giờ mở cửa, ảnh bản đồ), ảnh món thật (đặt trong `client/public/images/`, điền đường dẫn vào trường `image` của `drinks.json`).
- [ ] Kiểm tra responsive ở 3 độ rộng: 360px, 768px, 1280px; không có thanh cuộn ngang.

**Phụ thuộc:** không.

---

### Task 3 — TV3: Builder + Form tùy chỉnh món

**Pattern:**
- [ ] Cài `OrderItemBuilder` và `OrderItem` trong `server/src/patterns/creational/OrderItemBuilder.js` theo hợp đồng trong file.
- [ ] Giá topping phải tính bằng `addToppings()` của Decorator có sẵn (không tự cộng tay) để hai pattern phối hợp với nhau.
- [ ] Bỏ `todo` trong `server/tests/builder.test.js`, tất cả test PASS.

**API:**
- [ ] Cài `POST /api/cart/price` trong `server/src/routes/cart.routes.js`. Dữ liệu sai (món không tồn tại, size lạ, topping không có) trả lỗi 400/404 có thông báo tiếng Việt.
- [ ] Viết ít nhất 2 test API cho route này (xem cách viết trong `server/tests/api.test.js`).
- [ ] Trước khi TV1 merge Factory thì dùng `new BasicDrink(data)`; sau đó đổi sang `createDrinkFromData(data)`.

**Giao diện:** `client/src/pages/DrinkDetail.jsx`
- [ ] Form chọn size, mức đường, mức đá, topping (chọn nhiều), số lượng, ghi chú. Lấy lựa chọn từ `GET /api/options` và `GET /api/toppings`.
- [ ] Mỗi lần đổi lựa chọn gọi `POST /api/cart/price` để cập nhật giá.
- [ ] Nút "Thêm vào giỏ" gọi `CartStore.getInstance().addItem(...)`.
  `key` gợi ý: `drinkId|size|sugar|ice|toppingId đã sắp xếp|note`.

**Phụ thuộc:** nút "Thêm vào giỏ" cần `CartStore` của TV2.

---

### Task 4 — TV4: Strategy + Mã giảm giá

**Pattern:**
- [ ] Cài `PercentDiscount`, `FixedDiscount`, `FreeShipping`, `DiscountContext.checkout()` và `createDiscountStrategy()` trong `server/src/patterns/behavioral/DiscountStrategy.js`.
- [ ] Bỏ `todo` trong `server/tests/strategy.test.js`, tất cả test PASS.

**API:**
- [ ] Tạo `server/src/data/vouchers.json` với ít nhất 4 mã (xem mẫu trong `docs/API.md`): `MAY10`, `GIAM20K`, `FREESHIP` và một mã đã hết hạn để test.
- [ ] Tạo `server/src/services/voucherService.js`: kiểm tra mã tồn tại, còn hạn, đủ giá trị đơn tối thiểu, rồi mới chọn strategy và tính tiền. **Kiểm tra điều kiện không nằm trong lớp Strategy.**
  Hợp đồng (Sprint 2 TV1 dùng trong Facade): `voucherService.apply({ code, subtotal, shippingFee, now })` → `{ code, type, discount, total, message }`, lỗi thì `throw new HttpError(400|404, ...)`.
- [ ] Cài `POST /api/vouchers/validate` trong `server/src/routes/voucher.routes.js`.
- [ ] Viết ít nhất 3 test: mã đúng, mã hết hạn, đơn chưa đủ tối thiểu.

**Giao diện:**
- [ ] Tạo component `client/src/components/VoucherInput.jsx`, nhận `subtotal` qua props, hiện số tiền giảm + tổng mới hoặc thông báo lỗi.
- [ ] Làm độc lập, tạm thời thử trên trang Giỏ hàng với `subtotal` giả. TV1 sẽ gắn vào giỏ thật.

**Phụ thuộc:** không.

---

### Task 5 — TV5: State + Theo dõi đơn hàng

**Pattern:**
- [ ] Cài `PreparingState`, `DeliveringState`, `CompletedState`, `CancelledState` và hoàn thiện `PendingState`, `Order.setState()` (ghi `history`) trong `server/src/patterns/behavioral/OrderState.js`.
- [ ] Mỗi State tự quyết định chuyển sang State nào. **Không** dùng `if (status === ...)` trong `Order`.
- [ ] Bỏ `todo` trong `server/tests/state.test.js`, tất cả test PASS.

**API:**
- [ ] Cài `server/src/repositories/orderRepository.js` (file khung đã có hợp đồng) lưu đơn trong bộ nhớ, seed sẵn 3 đơn mẫu: `DH001` (PENDING), `DH002` (DELIVERING), `DH003` (CANCELLED). Sprint 2 TV1 (Facade) sẽ gọi `nextId()` và `save()` nên phải đúng hợp đồng.
- [ ] Cài `GET /api/orders/:id` và `PATCH /api/orders/:id/status` (body `{ action: 'next' | 'cancel' }`) trong `server/src/routes/order.routes.js`. Chuyển sai trạng thái trả **409**.
- [ ] Viết ít nhất 3 test API: xem đơn, chuyển hợp lệ, chuyển sai bị 409.
- [ ] Sửa test cuối trong `server/tests/api.test.js` (đang kiểm tra route trả 501) vì route đã được cài.

**Giao diện:** `client/src/pages/OrderTracking.jsx`
- [ ] Thanh tiến trình tô theo `status` thật; đơn bị hủy thì hiện nhãn "Đã hủy".
- [ ] Hai nút thử nghiệm "Chuyển bước tiếp" / "Hủy đơn", chỉ hiện nút có trong `allowedActions`.

**Phụ thuộc:** không.

---

## 4. Tiêu chí hoàn thành chung (áp dụng cho cả 5 task)

Một task chỉ được kéo sang cột **Done** khi:

1. `npm test` ở thư mục gốc chạy **không có test FAIL**, và test của mình đã bỏ `todo`.
2. Trang mình phụ trách chạy được trên trình duyệt, đã xóa khung `TaskNotice` của mình.
3. Đầu file pattern có khối chú thích: vấn đề, giải pháp, vai trò GoF của từng lớp (xem mẫu ở `ToppingDecorator.js`).
4. Viết 1 trang `docs/patterns/<ten-pattern>.md` gồm: vấn đề, sơ đồ lớp (Mermaid hoặc ảnh), vị trí trong code, lý do chọn (làm theo mẫu `docs/patterns/decorator.md`). Trang này dùng thẳng cho báo cáo cuối kỳ.
5. Tạo Pull Request vào `dev`, có ít nhất **1 người khác review** và approve.

---

## 5. Lịch trong sprint

| Ngày | Việc |
|---|---|
| T2 12/10 | TV1 tạo repo + Kanban. Mọi người clone, chạy `npm install` và `npm run dev` thành công, đọc `docs/QUY_UOC.md` |
| T2–T4 12–14/10 | Ai cũng làm **phần pattern + test trước** (không phụ thuộc ai). TV2 tạo PR `CartStore` sớm nhất có thể |
| CN 18/10 | Họp giữa sprint: mỗi người demo test của pattern mình đã PASS (5 phút/người) |
| T2–T7 19–24/10 | Làm API + giao diện, review chéo PR, tích hợp |
| CN 25/10 | Demo luồng: Landing → Menu → Chi tiết món → Thêm vào giỏ → Nhập voucher; mở trang đơn `DH001` và chuyển trạng thái. Merge `dev` → `main` |

**Review chéo gợi ý** (mỗi người review PR của người kế tiếp): TV1 → TV2 → TV3 → TV4 → TV5 → TV1.

---

## 6. Sprint 2

Task thứ hai của từng người đã được phân công trong `docs/PHAN_CONG_SPRINT_2.md`
(Facade, Observer, Adapter, Proxy, Chain of Responsibility). Đặc tả đầy đủ ở `docs/DAC_TA.md`.
