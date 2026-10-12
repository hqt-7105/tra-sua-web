# Phân công các công việc còn lại — 5 thành viên

> Cập nhật 12/10/2026. Gộp các việc chưa xong từ `PHAN_CONG_SPRINT_1.md`, `PHAN_CONG_SPRINT_2.md`, `PHAN_CONG_BO_SUNG.md` và Sprint 3.
> Chi tiết yêu cầu từng task xem file gốc. Prompt dán vào Claude Code của từng người: `PROMPTS_THANH_VIEN.md`.

---

## 1. Tình hình hiện tại

**Đã xong (3/20 task, đã đẩy nhánh, `npm test` xanh):**

| Task | Pattern | Người | Nhánh | Việc cần làm tiếp |
|---|---|---|---|---|
| Task 4 | Strategy + mã giảm giá | TV4 | `feature/tv4-strategy` | Mở PR vào `dev`, review, merge |
| Task 5 | State + theo dõi đơn | TV5 | `feature/tv5-state` | Mở PR, review, merge (sau Task 4) |
| Task 2 | Singleton CartStore + trang chủ | TV2 | `feature/tv2-singleton-cart` | Mở PR, review, merge (sau Task 5) |

> Ba nhánh xếp chồng nhau. **Merge đúng thứ tự TV4 → TV5 → TV2** để không xung đột. Trưởng nhóm làm bước này đầu tiên.

**Còn lại: 17 task trong 4 nhóm + 6 task Sprint 3 = 23 việc.**

---

## 2. Bảng tổng hợp

| Người | Còn lại | Số việc | Ước lượng |
|---|---|---|---|
| **TV1** (trưởng nhóm) | Task 1, 2.1, B1, C1, D6 | 5 | 30–38 giờ |
| **TV2** | 2.2, B2, C2, D4, D5 | 5 | 28–34 giờ |
| **TV3** | Task 3, 2.3, B3, C3, D2 | 5 | 30–38 giờ |
| **TV4** | 2.4, B4, C4, D6 (phần bảo mật) | 4 | 24–30 giờ |
| **TV5** | 2.5, B5, C5, D3 | 4 | 26–32 giờ |
| **Cả nhóm** | D1 (chạy test case, sửa lỗi) | 1 | mỗi người 3–4 giờ |

---

## 3. Chi tiết theo từng người

### TV1 — Trưởng nhóm, tích hợp

| Thứ tự | Mã | Việc | Hạn | Nhánh |
|---|---|---|---|---|
| 0 | — | Merge 3 PR đã xong theo thứ tự TV4 → TV5 → TV2 | 13/10 | — |
| 1 | **B1** | CI, CODEOWNERS, `HUONG_DAN_GIT.md`, bảng review chéo | 14/10 | `feature/tv1-infra` |
| 2 | **Task 1** | Factory Method + refactor `/drinks` + trang Giỏ hàng | 25/10 | `feature/tv1-factory-method` |
| 3 | **2.1** | Facade `placeOrder` + `POST /orders` + trang Checkout | 04/11 | `feature/tv1-facade` |
| 4 | **C1** | Test nghiệm thu theo 9 tiêu chí | 06/11 | `feature/tv1-acceptance-test` |
| 5 | **D6** | Rà soát cuối: README, bỏ hết `todo`, hết `TaskNotice`, kiểm tra `/api/admin` | 13/11 | `feature/tv1-final-review` |

Việc thường xuyên: điều phối tích hợp (Facade là nơi các pattern gặp nhau), chốt kịch bản demo 08/11, merge PR vào `dev`, merge `dev` → `main` cuối mỗi sprint.

---

### TV2 — UI/UX

| Thứ tự | Mã | Việc | Hạn | Nhánh |
|---|---|---|---|---|
| 1 | **B2** | Menu hamburger + rà responsive 360/768/1280px | 20/10 | `feature/tv2-responsive` |
| 2 | **2.2** | Observer + SSE + hook `useOrderEvents` + cập nhật thời gian thực | 03/11 | `feature/tv2-observer` |
| 3 | **C2** | Toast, Skeleton, ErrorBox, EmptyState dùng chung | 06/11 | `feature/tv2-ui-kit` |
| 4 | **D4** | Khung slide thuyết trình, ảnh chụp giao diện | 12/11 | `docs/tv2-slides` |
| 5 | **D5** | Quay video demo dự phòng, chạy thử demo trên máy trình bày | 14/11 | — |

Đã xong: Task 2 (Singleton, trang chủ, số ly Header). Còn việc mở PR và nhận review.

---

### TV3 — Fullstack

| Thứ tự | Mã | Việc | Hạn | Nhánh |
|---|---|---|---|---|
| 1 | **Task 3** | Builder + `POST /cart/price` + form tùy chỉnh món | 25/10 | `feature/tv3-builder` |
| 2 | **B3** | Validators dùng chung (BR11) + test | 22/10 | `feature/tv3-validators` |
| 3 | **C3** | Thêm 8 món mẫu + script `check-data` | 28/10 | `feature/tv3-seed-data` |
| 4 | **2.3** | Adapter + thanh toán giả lập (COD, MoMo, VNPay) + `/payment/mock` | 04/11 | `feature/tv3-adapter` |
| 5 | **D2** | (Tùy chọn) Chuyển repository sang SQLite theo ERD + script seed | 13/11 | `feature/tv3-database` |

**D2 chỉ làm nếu Sprint 2 xong đúng hạn.** Nếu trễ quá 3 ngày thì bỏ, giữ JSON (đã ghi trong rủi ro `KE_HOACH.md`).

---

### TV4 — Backend, bảo mật

| Thứ tự | Mã | Việc | Hạn | Nhánh |
|---|---|---|---|---|
| 1 | **B4** | Middleware `securityHeaders`, `rateLimit` + test | 22/10 | `feature/tv4-security` |
| 2 | **C4** | `docs/api.http`, `HUONG_DAN_API.md`, thêm 6 test API | 28/10 | `feature/tv4-api-http` |
| 3 | **2.4** | Proxy + đăng nhập + **thay middleware `auth` tạm** + quản lý menu admin + nhật ký | 04/11 | `feature/tv4-proxy` |
| 4 | **D6 (bảo mật)** | Rà `/api/admin` trả `401`/`403` đúng, gắn `rateLimit` cho `/admin/login`, test phân quyền | 12/11 | `feature/tv4-security-review` |

Đã xong: Task 4 (Strategy, mã giảm giá). Còn việc mở PR. **Bắt buộc:** thay middleware auth tạm ở Task 2.4 (tiêu chí nghiệm thu số 8).

---

### TV5 — Backend, QA

| Thứ tự | Mã | Việc | Hạn | Nhánh |
|---|---|---|---|---|
| 1 | **B5** | `TEST_CASES.md` ≥ 30 test case, bảng BR → test case | 22/10 | `feature/tv5-test-cases` |
| 2 | **C5** | `GET /orders/lookup` + trang `/orders/lookup` + test | 28/10 | `feature/tv5-order-lookup` |
| 3 | **2.5** | Chain of Responsibility (5 handler) + quản lý đơn admin | 04/11 | `feature/tv5-chain` |
| 4 | **D3** | Gom báo cáo: đặc tả, UML (use case, lớp, tuần tự, trạng thái, ERD), bảng "Pattern → file → người → test" | 14/11 | `docs/tv5-report` |

Đã xong: Task 5 (State, theo dõi đơn). Còn việc mở PR.

---

### D1 — Cả nhóm: chạy kiểm thử tổng

| Việc | Hạn |
|---|---|
| Mỗi người chạy tay phần `TEST_CASES.md` của mình trên bản chạy thật (chia theo chức năng), ghi kết quả (✅/❌), ngày, người chạy | 10–11/11 |
| Lỗi tìm được: tạo Issue trên GitHub, người phụ trách sửa trong 2 ngày | 12/11 |
| Chạy lại `npm test` (không còn `todo`) và `npm run test:acceptance` | 13/11 |

---

## 4. Lịch tổng

| Mốc | Ngày | Kết quả cần có |
|---|---|---|
| Merge 3 PR đã xong | 13/10 | Strategy, State, Singleton vào `dev` |
| Giữa Sprint 1 | 18/10 | Task 1, 3 đang chạy; demo test pattern |
| **Hết Sprint 1** | **25/10** | Task 1, 3 + B1–B5 xong; luồng: chọn món → tùy chỉnh → giỏ → mã giảm giá → xem đơn mẫu; merge `dev` → `main` |
| Giữa Sprint 2 | 01/11 | Chain, Adapter, Observer, Proxy có test PASS riêng |
| Chốt tích hợp | 04/11 | Facade nối đủ hệ thống con thật; mọi người merge xong phần của mình |
| **Demo cuối Sprint 2** | **08/11** | Chạy đủ kịch bản 9 bước ở `DAC_TA.md` mục 10 |
| Kiểm thử tổng (D1) | 10–13/11 | Không còn `todo`, không lỗi đỏ |
| **Hoàn thiện Sprint 3** | **15/11** | Báo cáo, slide, video, README |

---

## 5. Người review cho người (vòng tròn)

| Người mở PR | Người review chính |
|---|---|
| TV1 | TV2 |
| TV2 | TV3 |
| TV3 | TV4 |
| TV4 | TV5 |
| TV5 | TV1 |

PR cần 1 người duyệt rồi trưởng nhóm bấm merge vào `dev`. Người review kiểm tra theo checklist trong `.github/pull_request_template.md`.

---

## 6. Phụ thuộc giữa các task (ai chờ ai)

| Task | Cần có trước | Cách xử lý nếu bên kia trễ |
|---|---|---|
| 2.1 Facade (TV1) | 2.5 Chain, 2.3 Adapter, 2.2 Observer, Task 3 Builder, Task 4, 5 | Unit test Facade dùng đồ giả nên làm trước; nối hệ thống thật sau |
| 2.5 Chain (TV5) | B3 validators (TV3) | Tự viết tạm, thay bằng validators khi có |
| C5 tra cứu đơn (TV5) | Task 5 (đã xong) | Làm được ngay |
| 2.4 Proxy (TV4) | Không | Làm độc lập |
| C1 acceptance (TV1) | Các task liên quan | Test chưa có chức năng để `todo`, bỏ dần khi xong |
| D3 báo cáo (TV5) | `docs/patterns/*.md` của mọi người | Mỗi người viết `patterns/<ten>.md` ngay khi xong pattern |

---

## 7. Quy tắc

- Mọi quy tắc trong `QUY_UOC.md` và `CLAUDE.md` vẫn áp dụng: nhánh `feature/tvX-...`, PR vào `dev`, `npm test` không FAIL.
- Task chính luôn ưu tiên hơn task B, C, D. Ai trễ task phụ thì báo nhóm, không để ảnh hưởng task chính.
- Kẹt quá 1 ngày thì nhắn nhóm, đừng chờ.
- Mỗi người phải **tự giải thích được pattern của mình** (Singleton/Observer, Builder/Adapter, Strategy/Proxy, State/Chain, Factory/Facade). Buổi mini-demo giữa mỗi sprint: mỗi người trình bày 2 phút.
- Nếu một task được Claude Code làm hộ, người phụ trách vẫn phải đọc kỹ PR, chạy thử, và giải thích được trước khi merge.
