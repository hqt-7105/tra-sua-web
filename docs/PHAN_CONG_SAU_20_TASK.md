# Phân công sau khi hoàn thành 20 task (Claude Code đã làm phần code)

> Cập nhật 12/10/2026. Áp dụng khi Sprint 1, Sprint 2 và bổ sung B/C (20 task) đã xong và merge vào `dev`.
> Lúc này phần code đã có đủ, nên việc của 5 thành viên chuyển sang: **hiểu và làm chủ phần mình, kiểm thử, báo cáo, slide, demo**.

---

## 1. Các tính năng đã thực hiện (từ đầu dự án đến khi xong 20 task)

> Tình trạng xác nhận gần nhất từ Claude Code: **3/20 task đã xong** (Task 2, 4, 5), `npm test` server 51 pass, client 11 pass, 0 fail.
> Các dòng "Dự kiến" là phần Claude Code đang làm; khi các task đó merge và test xanh thì chuyển thành ✅.

### 1.1 Tính năng người dùng nhìn thấy

| # | Tính năng | Mô tả ngắn | Task | Trạng thái |
|---|---|---|---|---|
| 1 | Landing page | Giới thiệu thương hiệu, món bán chạy, lối vào menu, số ly trên Header | S0, Task 2 | ✅ Xong |
| 2 | Xem và tìm món | Lọc theo danh mục, tìm kiếm, chi tiết món (4 danh mục, 11 món) | S0, Task 1 | ✅ Cơ bản · Dự kiến: refactor Factory |
| 3 | Tùy chỉnh món | Size, đường, đá, nhiều topping, ghi chú; giá tính tự động | Task 3 | Dự kiến |
| 4 | Giỏ hàng | Thêm, sửa số lượng, xóa dòng; dùng chung mọi trang | Task 2, Task 1 | ✅ Store · Dự kiến: trang Giỏ hàng |
| 5 | Mã giảm giá | Giảm %, giảm số tiền cố định, miễn phí ship; báo lỗi khi hết hạn/chưa đủ tối thiểu | Task 4 | ✅ Xong |
| 6 | Đặt hàng | Nhập tên, SĐT, địa chỉ; kiểm tra theo chuỗi; báo lỗi ngay dưới từng ô; giờ mở cửa 08:00–22:00 | Task 2.1, 2.5 | Dự kiến |
| 7 | Thanh toán | COD, MoMo, VNPay (giả lập) và trang cổng thanh toán giả | Task 2.3 | Dự kiến |
| 8 | Theo dõi đơn | Trang xem trạng thái và lịch sử | Task 5 | ✅ Xong |
| 9 | Theo dõi đơn thời gian thực | Trạng thái tự cập nhật không cần tải lại trang | Task 2.2 | Dự kiến |
| 10 | Tra cứu đơn | Nhập mã đơn + số điện thoại | C5 | Dự kiến |
| 11 | Đăng nhập quản trị | Hai vai trò: quản trị (toàn quyền), nhân viên (xử lý đơn, chỉ xem menu) | Task 2.4 | Dự kiến |
| 12 | Xử lý đơn | Bảng đơn, lọc trạng thái, chuyển nhận → pha chế → giao → hoàn tất hoặc hủy; đơn mới hiện ngay | Task 2.5, 2.2 | Dự kiến |
| 13 | Quản lý menu và topping | Thêm, sửa, ngừng bán; chỉ quản trị được sửa | Task 2.4 | Dự kiến |
| 14 | Nhật ký thay đổi | Ghi ai sửa gì, lúc nào | Task 2.4 | Dự kiến |

### 1.2 Chất lượng và hạ tầng

| Hạng mục | Task | Trạng thái |
|---|---|---|
| Bộ khung client + server, chạy bằng `npm run dev`, dữ liệu mẫu JSON | S0 | ✅ |
| Tài liệu: kế hoạch, đặc tả, phân công, quy ước, API, `CLAUDE.md` | S0 | ✅ |
| Repo GitHub, nhánh `main`/`dev`, khóa nhánh | S0 | ✅ |
| Giao diện dùng tốt trên điện thoại (menu hamburger, rà 360/768/1280px) | B2 | Dự kiến |
| Thông báo, trạng thái tải, ô báo lỗi, trạng thái rỗng dùng chung | C2 | Dự kiến |
| Kiểm tra dữ liệu đầu vào dùng chung (họ tên, SĐT, địa chỉ) | B3 | Dự kiến |
| Thêm 8 món mẫu và script kiểm tra dữ liệu | C3 | Dự kiến |
| Header bảo mật, giới hạn số lần gọi | B4 | Dự kiến |
| Bộ gọi thử API (`api.http`), test API bổ sung | C4 | Dự kiến |
| Tự chạy test trên mỗi PR, CODEOWNERS, hướng dẫn git | B1 | Dự kiến |
| Bộ test nghiệm thu theo 9 tiêu chí | C1 | Dự kiến |
| 30 test case thủ công | B5 | Dự kiến |

### 1.3 Mẫu thiết kế (11 pattern)

| Nhóm | Pattern | Dùng để | File | Task | Trạng thái |
|---|---|---|---|---|---|
| Creational | Factory Method | Tạo đúng loại đồ uống theo danh mục | `creational/DrinkFactory.js` | 1 | Dự kiến |
| Creational | Singleton | Giỏ hàng dùng chung toàn trang | `client/src/store/cartStore.js` | 2 | ✅ |
| Creational | Builder | Dựng dòng món nhiều tùy chọn | `creational/OrderItemBuilder.js` | 3 | Dự kiến |
| Structural | Decorator | Topping cộng dồn giá và mô tả | `structural/ToppingDecorator.js` | S0 | ✅ |
| Structural | Facade | `placeOrder()` gom toàn bộ bước đặt đơn | `structural/OrderFacade.js` | 2.1 | Dự kiến |
| Structural | Adapter | Thống nhất COD, MoMo, VNPay | `structural/PaymentAdapter.js` | 2.3 | Dự kiến |
| Structural | Proxy | Phân quyền + ghi nhật ký khi sửa menu | `structural/MenuServiceProxy.js` | 2.4 | Dự kiến |
| Behavioral | Strategy | Các kiểu mã giảm giá | `behavioral/DiscountStrategy.js` | 4 | ✅ |
| Behavioral | State | Vòng đời đơn hàng | `behavioral/OrderState.js` | 5 | ✅ |
| Behavioral | Observer | Đẩy cập nhật đơn tới khách, admin, nhật ký | `behavioral/OrderEvents.js` | 2.2 | Dự kiến |
| Behavioral | Chain of Responsibility | Chuỗi kiểm tra trước khi tạo đơn | `behavioral/OrderValidation.js` | 2.5 | Dự kiến |

**Chưa có trong 20 task (ngoài phạm vi hoặc để Sprint 3):** CSDL thật (hiện dữ liệu ở JSON và bộ nhớ, tắt server là mất đơn), thanh toán thật, tài khoản khách hàng, thông báo SMS/email, bản đồ giao hàng.

---

## 2. Việc còn lại sau khi 20 task xong

Số việc còn lại: **6 việc Sprint 3** (D1–D6) + **5 việc "làm chủ phần mình"** (M1–M5, mỗi người một) = **11 việc**.

| Người | Việc còn lại | Ước lượng |
|---|---|---|
| **TV1** | M1, D6 (rà cuối), kịch bản demo, D1 | 14–18 giờ |
| **TV2** | M2, D4 (slide), D5 (video demo), D1 | 14–18 giờ |
| **TV3** | M3, D2 (CSDL, tùy chọn hoặc ghi đơn ra file), D1 | 14–20 giờ |
| **TV4** | M4, D6 (bảo mật), D1 | 12–16 giờ |
| **TV5** | M5, D3 (báo cáo), D1 (điều phối) | 16–20 giờ |

---

## 3. Việc "làm chủ phần mình" (M1–M5)

Vì phần code do Claude Code làm hộ, mỗi người phải chứng minh hiểu được pattern của mình. Đây là việc **bắt buộc**, làm trước các việc khác.

**Mỗi người làm đủ 5 bước cho từng pattern của mình:**
1. Đọc kỹ PR và file pattern, chạy `npm test` và chạy thử trên trình duyệt.
2. Vẽ lại **sơ đồ lớp** của pattern bằng tay hoặc Mermaid, ghi rõ vai trò GoF của từng lớp.
3. Mở `docs/patterns/<ten>.md` và **viết lại phần "Vì sao chọn pattern này" bằng lời của mình** (Claude có thể viết nháp, nhưng phải sửa cho đúng cách hiểu của người trình bày).
4. Tập nói 2 phút cho mỗi pattern: vấn đề → giải pháp → vai trò lớp → chỉ vào đúng dòng code.
5. Trả lời được câu hỏi mẫu ở bảng dưới mà không nhìn tài liệu.

| Mã | Người | Pattern phải nắm | Câu hỏi mẫu giảng viên có thể hỏi |
|---|---|---|---|
| **M1** | TV1 | Factory Method, Facade | "Nếu thêm danh mục mới thì sửa ở đâu? Facade khác gì gọi trực tiếp từng service?" |
| **M2** | TV2 | Singleton, Observer | "Làm sao đảm bảo chỉ có một CartStore? Observer khác gì gọi hàm trực tiếp?" |
| **M3** | TV3 | Builder, Adapter | "Vì sao dùng Builder thay vì constructor nhiều tham số? Adapter chuyển đổi những gì giữa MoMo và VNPay?" |
| **M4** | TV4 | Strategy, Proxy | "Thêm loại mã giảm giá mới cần sửa gì? Proxy khác Decorator ở đâu?" |
| **M5** | TV5 | State, Chain of Responsibility | "Vẽ sơ đồ trạng thái của đơn. Thêm một bước kiểm tra mới vào chuỗi thì làm sao?" |

Cả nhóm nên hiểu thêm **Decorator** (mẫu có sẵn) vì nó chạm vào mọi luồng tính giá.

**Xong khi:** tập 2 phút xong trước cả nhóm và được ít nhất một bạn khác hỏi thử một câu mà trả lời được.

---

## 4. Việc Sprint 3 (D1–D6)

| Mã | Việc | Người | Chi tiết |
|---|---|---|---|
| **D1** | Chạy kiểm thử tổng | Cả nhóm, TV5 điều phối | Mỗi người chạy tay phần `TEST_CASES.md` của chức năng mình, ghi ✅/❌, ngày, người chạy. Lỗi tìm được: tạo Issue trên GitHub, người phụ trách sửa trong 2 ngày. Cuối cùng chạy `npm test` (không còn `todo`) và `npm run test:acceptance`. |
| **D2** | Lưu dữ liệu lâu dài (tùy chọn) | TV3 | Chuyển `orderRepository` và `menuRepository` sang SQLite theo ERD (`DAC_TA.md` mục 6), có script tạo bảng và dữ liệu mẫu, giữ nguyên toàn bộ test. Nếu không đủ thời gian: chỉ ghi đơn ra `orders.json` để tắt bật server không mất. |
| **D3** | Báo cáo | TV5 gom, mỗi người viết phần mình | Đặc tả, sơ đồ use case, sơ đồ lớp từng pattern, sơ đồ tuần tự đặt hàng, sơ đồ trạng thái đơn, ERD, bảng "Pattern → file → người → test", ảnh chụp giao diện, kết quả `npm test`. Chi tiết xem `KE_HOACH.md` mục 7. |
| **D4** | Slide thuyết trình | TV2 làm khung, mỗi người thêm phần pattern của mình | Khoảng 15–20 slide: giới thiệu, kiến trúc, 11 pattern (mỗi pattern 1 slide: vấn đề, giải pháp, sơ đồ, code), demo, kết luận. |
| **D5** | Video demo dự phòng | TV2 quay, TV1 chạy thử trước | Quay theo kịch bản 9 bước ở `DAC_TA.md` mục 10. Chạy thử trên máy trình bày trước ngày bảo vệ 1 ngày, dữ liệu mẫu cố định. |
| **D6** | Rà soát cuối | TV1 (README, `todo`) + TV4 (bảo mật) | TV1: README hướng dẫn chạy cho người lạ, không còn `todo`, không còn `TaskNotice`, kiểm tra `npm install` từ máy sạch. TV4: `/api/admin` trả `401` khi chưa đăng nhập, `403` khi sai quyền, `rateLimit` cho login, không còn middleware auth tạm. |

---

## 4b. Chi tiết từng người

Mỗi việc có: mục tiêu, danh sách việc cần tick, file liên quan, nhánh git, điều kiện "xong". Làm theo thứ tự từ trên xuống.

### TV1 — Trưởng nhóm

**M1 — Làm chủ Factory Method và Facade** (nhánh: không cần, chỉ sửa `docs/patterns/`)
- [ ] Đọc PR Task 1 và Task 2.1; chạy `npm test`, chạy luồng đặt hàng đầy đủ trên trình duyệt.
- [ ] Vẽ sơ đồ lớp Factory Method (Creator, ConcreteCreator, Product) và Facade (Facade, các hệ thống con) vào `docs/patterns/factory-method.md`, `docs/patterns/facade.md`.
- [ ] Viết lại mục "Vì sao chọn" bằng lời của mình; chỉ ra đúng dòng code của 7 bước `placeOrder()`.
- [ ] Tập trình bày 2 phút mỗi pattern; trả lời được câu hỏi mẫu ở mục 3.

**D6a — Rà soát cuối (README, todo, TaskNotice)** — nhánh `feature/tv1-final-review`
- [ ] `grep` toàn repo: không còn `{ todo:`, không còn `TaskNotice`, không còn `TODO`/`console.log` thừa.
- [ ] README: hướng dẫn chạy cho người lạ, danh sách tài khoản demo, bảng pattern có trạng thái ✅ đủ 11.
- [ ] Thử trên máy sạch (hoặc thư mục mới clone): `npm install` → `npm run dev` → `npm test` → mở web, không lỗi.
- [ ] Cập nhật bảng trạng thái trong `docs/API.md` (mọi endpoint ✅).
- **Xong khi:** người ngoài nhóm làm theo README chạy được trong 5 phút.

**KB1 — Chốt kịch bản demo** — `docs/KICH_BAN_DEMO.md`
- [ ] Lấy 9 bước ở `DAC_TA.md` mục 10, thêm lời thoại ngắn và người thao tác cho từng bước.
- [ ] Chuẩn bị dữ liệu mẫu cố định (vài đơn mẫu, 3 mã giảm giá) để demo luôn giống nhau.
- [ ] Chạy thử trọn vẹn ít nhất 2 lần, ghi thời gian (mục tiêu dưới 10 phút).

**D1 — Chạy test case (phần của TV1):** UC02, UC04, UC06 (xem, giỏ hàng, đặt hàng).

---

### TV2 — UI/UX

**M2 — Làm chủ Singleton và Observer**
- [ ] Đọc PR Task 2 và Task 2.2; thử mở 2 tab, đổi trạng thái đơn ở admin và xem tab khách tự cập nhật.
- [ ] Vẽ sơ đồ lớp Singleton (`CartStore`, `getInstance`) và Observer (Subject, Observer, các subscriber: SSE khách, SSE admin, nhật ký) vào `docs/patterns/singleton.md`, `observer.md`.
- [ ] Viết lại "Vì sao chọn" bằng lời của mình; giải thích tại sao dùng SSE thay vì tải lại trang.
- [ ] Tập 2 phút mỗi pattern.

**D4 — Slide thuyết trình** — `docs/slides/` hoặc file `.pptx`
- [ ] Khung 15–20 slide: (1) tên đề tài, (2) mục tiêu, (3) chức năng chính, (4) kiến trúc, (5–15) mỗi pattern 1 slide: Vấn đề → Giải pháp → Sơ đồ lớp → Đoạn code → Kết quả, (16) demo, (17) kiểm thử, (18) kết luận.
- [ ] Mỗi người điền slide của 2 pattern mình (TV2 làm khung và theme chung).
- [ ] Ảnh chụp giao diện: landing, menu, tùy chỉnh món, giỏ, thanh toán, theo dõi đơn, admin (cả khung điện thoại).
- **Xong khi:** đủ 11 slide pattern, mỗi slide có sơ đồ và trích code đúng file thật.

**D5 — Video demo dự phòng**
- [ ] Quay màn hình theo `KICH_BAN_DEMO.md`, có thuyết minh, dài 5–8 phút, xuất `.mp4`.
- [ ] Chạy thử toàn bộ demo trên máy sẽ trình bày, kiểm tra cổng 3001/5173 không bị chiếm.
- [ ] Lưu video 2 nơi (máy và Google Drive).

**D1 — Chạy test case (phần của TV2):** UC01, UC03 (giao diện tùy chỉnh), UC08 (theo dõi), responsive 360px.

---

### TV3 — Fullstack

**M3 — Làm chủ Builder và Adapter**
- [ ] Đọc PR Task 3 và Task 2.3; thử thanh toán MoMo thành công, VNPay hủy.
- [ ] Vẽ sơ đồ lớp Builder (Director, Builder, Product) và Adapter (Target `PaymentGateway`, Adapter, Adaptee SDK giả) vào `docs/patterns/builder.md`, `adapter.md`.
- [ ] Viết lại "Vì sao chọn"; chỉ ra Adapter chuyển đổi những gì (tên trường, đơn vị tiền, mã kết quả, chữ ký).
- [ ] Tập 2 phút mỗi pattern.

**D2 — Lưu dữ liệu lâu dài (tùy chọn)** — nhánh `feature/tv3-database`
Chỉ làm khi M3 xong và Sprint 2 đã merge. Hai mức:
- *Mức tối thiểu (3–4 giờ):* `orderRepository` ghi/đọc `server/src/data/orders.json` để tắt bật server không mất đơn; test vẫn xanh.
- *Mức đầy đủ (10–12 giờ):* chuyển sang SQLite theo ERD trong `DAC_TA.md` mục 6.
  - [ ] Script tạo bảng và nạp dữ liệu mẫu (`server/scripts/init-db.js`), `npm run init-db`.
  - [ ] Viết lại `menuRepository`, `orderRepository` dùng DB, **giữ nguyên chữ ký hàm**.
  - [ ] Toàn bộ `npm test` vẫn xanh, không sửa test.
  - [ ] File `.db` thêm vào `.gitignore`; README ghi cách khởi tạo.
- **Xong khi:** tắt rồi bật lại server, đơn đã đặt vẫn còn.

**D1 — Chạy test case (phần của TV3):** UC03 (tính giá), UC07 (thanh toán).

---

### TV4 — Backend, bảo mật

**M4 — Làm chủ Strategy và Proxy**
- [ ] Đọc PR Task 4 và Task 2.4; thử 3 loại mã, đăng nhập admin và staff, sửa menu bằng cả hai tài khoản.
- [ ] Vẽ sơ đồ lớp Strategy (Context, Strategy, các ConcreteStrategy) và Proxy (Subject, RealSubject, Proxy) vào `docs/patterns/strategy.md`, `proxy.md`.
- [ ] Viết lại "Vì sao chọn"; phân biệt Proxy với Decorator bằng ví dụ trong dự án.
- [ ] Tập 2 phút mỗi pattern.

**D6b — Rà soát bảo mật** — nhánh `feature/tv4-security-review`
- [ ] Gọi từng endpoint `/api/admin/*` không token: phải `401`. Token staff gọi route chỉ dành quản trị: phải `403`.
- [ ] Không còn middleware auth tạm; `grep` xác nhận.
- [ ] `rateLimit` gắn cho `/admin/login` (5 lần/phút), thử bằng script.
- [ ] Mật khẩu chỉ lưu dạng băm; không có bí mật trong repo (`git grep -i password`, `token`, `secret`).
- [ ] Viết `server/tests/authorization.test.js`: bảng quyền admin/staff/khách cho mỗi route.
- **Xong khi:** test phân quyền PASS và có bảng "route × vai trò" trong `docs/API.md`.

**D1 — Chạy test case (phần của TV4):** UC05 (mã giảm giá), UC09, UC11, UC12 (đăng nhập, menu, nhật ký).

---

### TV5 — Backend, QA

**M5 — Làm chủ State và Chain of Responsibility**
- [ ] Đọc PR Task 5 và Task 2.5; thử hủy đơn ở từng trạng thái, thử đặt đơn sai SĐT, ngoài giờ.
- [ ] Vẽ sơ đồ trạng thái đơn và sơ đồ lớp Chain (Handler, 5 ConcreteHandler) vào `docs/patterns/state.md`, `chain-of-responsibility.md`.
- [ ] Viết lại "Vì sao chọn"; giải thích thêm một bước kiểm tra mới vào chuỗi cần sửa những gì.
- [ ] Tập 2 phút mỗi pattern.

**D3 — Báo cáo** — `docs/BAO_CAO.md` (hoặc file Word xuất từ đây)
| Chương | Nội dung | Người viết |
|---|---|---|
| 1 | Giới thiệu, mục tiêu, phạm vi | TV1 |
| 2 | Đặc tả: use case, quy tắc nghiệp vụ, màn hình (lấy từ `DAC_TA.md`) | TV5 |
| 3 | Thiết kế: kiến trúc, ERD, sơ đồ tuần tự đặt hàng | TV5 |
| 4 | Mẫu thiết kế Creational (3 pattern) | TV1 (Factory), TV2 (Singleton), TV3 (Builder) |
| 5 | Mẫu thiết kế Structural (4 pattern) | TV1 (Facade), TV3 (Adapter), TV4 (Proxy); Decorator cả nhóm |
| 6 | Mẫu thiết kế Behavioral (4 pattern) | TV4 (Strategy), TV5 (State, Chain), TV2 (Observer) |
| 7 | Kiểm thử: kết quả `npm test`, `TEST_CASES.md`, nghiệm thu | TV5 |
| 8 | Giao diện: ảnh chụp các màn hình | TV2 |
| 9 | Kết luận, hạn chế, hướng phát triển, phân công thực tế | TV1 |
Mỗi chương pattern theo khuôn: Vấn đề → Giải pháp → Sơ đồ lớp → Vị trí code → Lý do chọn (gom từ `docs/patterns/*.md`).
- [ ] Gom đủ 9 chương, đồng bộ cách đánh số hình, bảng.
- [ ] Bảng "Pattern → file → người → test" ở phụ lục.
- **Xong khi:** đọc từ đầu đến cuối không còn mục trống, sơ đồ vẽ được trên Mermaid hoặc ảnh.

**D1 — Điều phối chạy test case:** UC08, UC10; lập bảng kết quả tổng, gom lỗi thành Issue, theo dõi đến khi sửa xong.

---

## 5. Lịch

Mốc **T** là ngày 20 task xong và merge vào `dev`.

| Thời điểm | Việc |
|---|---|
| T → T+3 ngày | **M1–M5:** mọi người đọc PR, viết lại phần giải thích, tập 2 phút |
| T+3 | **Buổi tập chung:** mỗi người trình bày 2 pattern, bạn khác hỏi thử câu hỏi mẫu |
| T+3 → T+7 | **D1** chạy test case, sửa lỗi; **D6** rà soát; **D2** nếu làm |
| T+5 → T+10 | **D3** báo cáo, **D4** slide |
| T+10 | **D5** quay video, chạy thử demo toàn nhóm |
| **Chậm nhất 15/11** | Mọi thứ xong: báo cáo, slide, video, `dev` → `main` |

Nếu 20 task xong muộn hơn kế hoạch, giữ nguyên hạn 15/11 và bỏ D2 trước.

---

## 6. Quy tắc

- Quy tắc ở `QUY_UOC.md` và `CLAUDE.md` vẫn áp dụng, mọi thay đổi đi qua PR, 1 người duyệt, trưởng nhóm merge.
- Việc M1–M5 ưu tiên hơn D2. Không làm D2 khi chưa tập xong phần trình bày.
- Mỗi người **ghi vào báo cáo phần mình đã làm thật** (đọc, kiểm thử, viết lại giải thích, sửa lỗi). Báo cáo trung thực về việc dùng Claude Code, nếu giảng viên hỏi.
- Kẹt quá 1 ngày thì nhắn nhóm, đừng chờ.
