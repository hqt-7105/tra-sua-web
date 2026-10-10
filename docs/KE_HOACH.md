# Kế hoạch dự án — Website Mây Trà Sữa áp dụng Design Patterns

> Cập nhật 10/10/2026 · Nhóm 5 người · Đặc tả chi tiết: `DAC_TA.md`

---

## 1. Mục tiêu và hướng đi

Xây website bán trà sữa gồm **landing page** giới thiệu thương hiệu và **luồng đặt hàng hoàn chỉnh**:
chọn món → tùy chỉnh → giỏ hàng → mã giảm giá → đặt hàng → thanh toán → theo dõi đơn, kèm **trang quản trị** xử lý đơn và quản lý menu.

**Vì sao không làm landing page thuần?** Landing page chỉ có nội dung tĩnh, gần như không có logic nghiệp vụ, nên rất khó áp dụng đủ 3 nhóm mẫu thiết kế một cách tự nhiên. Luồng đặt hàng có đủ bài toán thật để mỗi pattern giải quyết một vấn đề cụ thể. Ví dụ: Decorator xử lý tổ hợp topping, State xử lý vòng đời đơn.

**Yêu cầu môn học:** mỗi nhóm GoF (Creational, Structural, Behavioral) áp dụng ít nhất 1 pattern.
**Kế hoạch của nhóm:** áp dụng **11 pattern**, mỗi thành viên tự cài và giải thích được **2 pattern**.

---

## 2. Các quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Frontend | React 18 + Vite + React Router, CSS thuần (biến màu ở `:root`) |
| Backend | Node.js 20+ + Express, ES Modules |
| Dữ liệu | Sprint 1–2: JSON + bộ nhớ qua tầng repository. Sprint 3: chuyển sang SQLite/MySQL |
| Thanh toán | **Giả lập** MoMo/VNPay bằng SDK giả trong code, không gọi cổng thật |
| Thời gian thực | Server-Sent Events (không cần thư viện WebSocket) |
| Kiểm thử | `node:test` có sẵn, không thêm thư viện. Test chấp nhận viết sẵn cho từng pattern |
| Quy trình | Sprint 2 tuần, mỗi người 1 lát dọc/sprint, PR + review chéo |

---

## 3. Mẫu thiết kế áp dụng

| Nhóm | Pattern | Áp dụng vào | Sprint | Phụ trách |
|---|---|---|---|---|
| **Creational** | Factory Method | Tạo đúng loại đồ uống theo danh mục | 1 | TV1 |
| | Singleton | Giỏ hàng dùng chung toàn trang | 1 | TV2 |
| | Builder | Dựng dòng món nhiều tùy chọn | 1 | TV3 |
| **Structural** | Decorator | Topping cộng dồn giá và mô tả | 0 | Mẫu có sẵn |
| | Facade | `OrderFacade.placeOrder()` gom toàn bộ bước đặt đơn | 2 | TV1 |
| | Adapter | Thống nhất COD, MoMo, VNPay | 2 | TV3 |
| | Proxy | Phân quyền + ghi nhật ký khi sửa menu | 2 | TV4 |
| **Behavioral** | Strategy | Các kiểu mã giảm giá | 1 | TV4 |
| | State | Vòng đời đơn hàng | 1 | TV5 |
| | Observer | Đẩy cập nhật đơn tới khách, admin, nhật ký | 2 | TV2 |
| | Chain of Responsibility | Chuỗi kiểm tra trước khi tạo đơn | 2 | TV5 |

---

## 4. Lộ trình theo sprint

| Sprint | Thời gian | Mục tiêu | Kết quả demo |
|---|---|---|---|
| **0** ✅ | 10/10 | Bộ khung chung | Web chạy được: landing, menu, chi tiết món. Decorator mẫu. Khung + test cho 10 pattern còn lại |
| **1** | 12/10 – 25/10 | Luồng mua cơ bản | Chọn món → tùy chỉnh → giỏ → mã giảm giá; xem và đổi trạng thái đơn mẫu |
| **2** | 26/10 – 08/11 | Đặt hàng, thanh toán, quản trị | Đặt đơn thật, thanh toán giả lập, admin xử lý đơn, trang khách tự cập nhật, phân quyền menu |
| **3** | 09/11 – 15/11 | Hoàn thiện | Dữ liệu trong CSDL, không còn test `todo`, báo cáo, slide, chạy thử demo |
| Bảo vệ | sau 15/11 | — | Demo theo kịch bản `DAC_TA.md` mục 10 |

> Các mốc ngày chỉnh theo hạn nộp thực tế của lớp. Nếu thiếu thời gian: gộp Sprint 3 vào tuần cuối Sprint 2 và bỏ phần chuyển CSDL. Tầng repository vẫn giữ nguyên nên không ảnh hưởng điểm pattern.

### Phạm vi từng sprint

**Sprint 1** — chi tiết `PHAN_CONG_SPRINT_1.md`
- Factory Method, Singleton, Builder, Strategy, State (+ test chấp nhận)
- API: tính giá món, kiểm tra mã giảm giá, xem/đổi trạng thái đơn
- Giao diện: hoàn thiện landing, chi tiết món, giỏ hàng, ô mã giảm giá, theo dõi đơn

**Sprint 2** — chi tiết `PHAN_CONG_SPRINT_2.md`
- Facade, Observer, Adapter, Proxy, Chain of Responsibility (+ test chấp nhận)
- API: đặt đơn, thanh toán, đăng nhập, quản lý menu, quản lý đơn, luồng SSE
- Giao diện: đặt hàng, cổng thanh toán giả, khu quản trị, cập nhật thời gian thực

**Sprint 3** — đề xuất, chốt tại buổi demo 08/11
- Chuyển repository sang CSDL theo ERD (`DAC_TA.md` mục 6), script tạo dữ liệu mẫu
- Kiểm thử tổng theo 9 tiêu chí nghiệm thu, sửa lỗi, rà responsive
- Báo cáo, slide, quay video demo dự phòng

---

## 5. Phân công tổng

| Thành viên | Vai trò chính | Sprint 1 | Sprint 2 | Sprint 3 (đề xuất) |
|---|---|---|---|---|
| **TV1** | Trưởng nhóm, tích hợp | Factory Method + trang Giỏ hàng + repo/Kanban | Facade + Đặt hàng + tích hợp | Kịch bản demo, slide, README hướng dẫn chạy |
| **TV2** | UI/UX | Singleton + Landing page | Observer + cập nhật thời gian thực | Rà giao diện, responsive, ảnh chụp cho báo cáo |
| **TV3** | Fullstack | Builder + form tùy chỉnh món | Adapter + thanh toán giả lập | Chuyển dữ liệu sang CSDL (repository), script seed |
| **TV4** | Backend, bảo mật | Strategy + mã giảm giá | Proxy + đăng nhập + quản lý menu | Rà bảo mật, test phân quyền, test API còn thiếu |
| **TV5** | Backend, QA | State + theo dõi đơn | Chain of Responsibility + quản lý đơn | Tổng hợp báo cáo (UML, ERD, bảng pattern), bảng test case |

**Khối lượng:** mỗi sprint mỗi người khoảng 10–16 giờ. Ai xong sớm thì nhận review và viết thêm test cho người khác, không nhận thêm tính năng mới.

---

## 6. Cách làm việc

- **Git:** `main` (ổn định) ← `dev` (tích hợp) ← `feature/tvX-...`. Không push thẳng vào `main`/`dev`. Chi tiết trong `QUY_UOC.md`.
- **Họp:** đầu sprint (chia việc), giữa sprint (demo test pattern), cuối sprint (demo luồng, merge `dev` → `main`).
- **Kanban:** Todo / Doing / Review / Done; một thẻ = một task trong file phân công.
- **Định nghĩa "xong":** test chấp nhận PASS + test API → trang chạy được → có chú thích GoF + `docs/patterns/<ten>.md` → PR được review.
- **Hợp đồng trước, code sau:** mỗi pattern đã có hợp đồng trong file khung. Ai muốn đổi hợp đồng phải báo nhóm vì người khác đang code theo nó.

---

## 7. Sản phẩm nộp cuối

1. Mã nguồn trên GitHub, README hướng dẫn chạy (`npm install` → `npm run dev`).
2. Báo cáo, gồm:
   - Đặc tả (`DAC_TA.md`)
   - Sơ đồ use case, ERD, sơ đồ tuần tự đặt hàng, sơ đồ trạng thái đơn
   - **Mỗi pattern 1 mục:** vấn đề → giải pháp → sơ đồ lớp → vị trí code → lý do chọn (gom từ `docs/patterns/`)
   - Bảng tổng hợp "Pattern → file → người phụ trách → test"
   - Ảnh chụp giao diện, kết quả `npm test`
3. Slide và demo theo kịch bản 9 bước trong `DAC_TA.md` mục 10.

---

## 8. Rủi ro và cách xử lý

| Rủi ro | Dấu hiệu | Cách xử lý |
|---|---|---|
| Một người chậm làm cả nhóm chờ | Test pattern chưa PASS ở buổi giữa sprint | Unit test đều dùng đồ giả nên không ai phải chờ; phần tích hợp có hạn merge riêng (Sprint 2: T4 04/11) |
| Pattern bị nhận xét "gắn gượng" | Không nói được pattern giải quyết vấn đề gì | Mỗi file có khối "Vấn đề / Giải pháp"; mỗi người tập trình bày 2 phút cho 2 pattern của mình |
| Đổi hợp đồng giữa chừng | Test của người khác đỏ sau khi merge | Mọi thay đổi hợp đồng phải báo nhóm và sửa test cùng PR |
| Middleware xác thực tạm bị quên | `/api/admin` vẫn vào được khi chưa đăng nhập | Bắt buộc trong task TV4; nằm trong tiêu chí nghiệm thu số 8 |
| Thiếu thời gian Sprint 3 | Sprint 2 trễ quá 3 ngày | Bỏ chuyển CSDL, giữ JSON; ưu tiên báo cáo và demo |
| Lỗi khi demo trực tiếp | — | Quay video demo dự phòng; seed dữ liệu cố định; chạy thử trên máy demo trước 1 ngày |

---

## 9. Tài liệu trong thư mục `docs/`

| File | Nội dung |
|---|---|
| `KE_HOACH.md` | Tài liệu này |
| `DAC_TA.md` | Đặc tả: use case, quy tắc nghiệp vụ, màn hình, ERD, kiến trúc, sơ đồ, nghiệm thu |
| `PHAN_CONG_SPRINT_1.md` | Task thứ nhất của 5 thành viên |
| `PHAN_CONG_SPRINT_2.md` | Task thứ hai của 5 thành viên |
| `API.md` | Hợp đồng API, ví dụ request/response |
| `QUY_UOC.md` | Git, commit, PR, quy ước code, test |
| `patterns/*.md` | Giải thích từng pattern (mẫu: `decorator.md`) |
