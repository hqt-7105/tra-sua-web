# Phân công bổ sung — 2 task nữa cho mỗi thành viên

> Bổ sung cho `PHAN_CONG_SPRINT_1.md` và `PHAN_CONG_SPRINT_2.md`. Mục đích: **đẩy nhanh tiến độ** bằng các việc độc lập, nhỏ, không chờ nhau.
> Mỗi người có **task B** (làm trong Sprint 1, sau khi xong task chính) và **task C** (làm trong Sprint 2, hoặc làm sớm nếu rảnh).

---

## 1. Tổng số task của dự án

| Nhóm | Số task | Ước lượng mỗi task | Nằm ở |
|---|---|---|---|
| Task chính Sprint 1 (mỗi người 1) | 5 | 10–14 giờ | `PHAN_CONG_SPRINT_1.md` |
| Task chính Sprint 2 (mỗi người 1) | 5 | 10–16 giờ | `PHAN_CONG_SPRINT_2.md` |
| **Task bổ sung B (mỗi người 1)** | **5** | **4–6 giờ** | tài liệu này |
| **Task bổ sung C (mỗi người 1)** | **5** | **4–6 giờ** | tài liệu này |
| **Tổng** | **20** | — | — |

Mỗi người có **4 task** (2 chính + 2 bổ sung). Tổng sức người mỗi thành viên khoảng **28–40 giờ** cho cả hai sprint.

> Sprint 3 (hoàn thiện, báo cáo, slide) là phần riêng, nằm ngoài 20 task này.

---

## 2. Quy tắc chung

- Mọi quy tắc trong `QUY_UOC.md` và `CLAUDE.md` vẫn áp dụng: nhánh `feature/tvX-...`, PR vào `dev`, 1 người duyệt, `npm test` không có FAIL.
- Task bổ sung **không đụng file pattern của người khác**. Nếu phải sửa file ngoài danh sách "File được sửa", hãy hỏi trưởng nhóm trước.
- Task bổ sung **không thay đổi hợp đồng** (contract) hay `docs/API.md` đã chốt.
- Task nhỏ nên làm **một PR một task**, đừng gộp.
- Xong task thì kéo thẻ Kanban sang Review và gửi link PR vào nhóm chat.

---

## 3. Bảng tổng quan

| Mã | Người | Việc | Loại | Giờ | Nhánh git |
|---|---|---|---|---|---|
| **B1** | TV1 | Hạ tầng nhóm: CI, CODEOWNERS, hướng dẫn git | Hạ tầng | 4 | `feature/tv1-infra` |
| **C1** | TV1 | Test tích hợp theo 9 tiêu chí nghiệm thu | Kiểm thử | 6 | `feature/tv1-acceptance-test` |
| **B2** | TV2 | Menu điện thoại (hamburger) + rà responsive | Giao diện | 5 | `feature/tv2-responsive` |
| **C2** | TV2 | Toast, Skeleton, ô báo lỗi dùng chung | Giao diện | 5 | `feature/tv2-ui-kit` |
| **B3** | TV3 | Bộ kiểm tra dữ liệu đầu vào dùng chung (validators) | Backend + FE | 5 | `feature/tv3-validators` |
| **C3** | TV3 | Mở rộng menu mẫu + script kiểm tra dữ liệu | Dữ liệu | 4 | `feature/tv3-seed-data` |
| **B4** | TV4 | Middleware bảo mật: header, giới hạn tần suất | Backend | 5 | `feature/tv4-security` |
| **C4** | TV4 | Bộ gọi thử API `docs/api.http` + test API bổ sung | Kiểm thử | 5 | `feature/tv4-api-http` |
| **B5** | TV5 | Bảng test case thủ công | Kiểm thử | 5 | `feature/tv5-test-cases` |
| **C5** | TV5 | Trang tra cứu đơn theo mã + số điện thoại | Fullstack | 6 | `feature/tv5-order-lookup` |

---

## 4. Chi tiết từng task

### B1 — TV1: Hạ tầng nhóm (CI, CODEOWNERS, hướng dẫn git)

**Mục tiêu:** để GitHub tự chạy test trên mỗi PR, tự gắn người review, và cả nhóm có tài liệu xử lý lỗi git.

**Việc cần làm**
1. Tạo `.github/workflows/test.yml`: chạy khi có PR vào `dev` và `main`; dùng Node 22; chạy `npm ci` rồi `npm test`. Không cần cache phức tạp.
2. Tạo `.github/CODEOWNERS`: ghi file/thư mục nào thuộc người nào (bảng phân công tổng trong `KE_HOACH.md`). Dùng username GitHub thật của từng bạn.
3. Viết `docs/HUONG_DAN_GIT.md` (1–2 trang): quy trình clone → nhánh → PR; cách giải quyết conflict từng bước; 5 lỗi hay gặp (quên pull, commit nhầm nhánh, push bị từ chối, conflict ở `package-lock.json`, lỡ commit file `node_modules`) và cách xử lý.
4. Thêm bảng "ai review cho ai" (vòng tròn TV1→TV2→TV3→TV4→TV5→TV1) vào `docs/QUY_UOC.md`.

**File được sửa:** `.github/*`, `docs/HUONG_DAN_GIT.md`, `docs/QUY_UOC.md`
**Xong khi:** mở một PR thử thì thấy CI chạy và hiện dấu xanh; người review được gắn tự động.

---

### C1 — TV1: Test tích hợp theo 9 tiêu chí nghiệm thu

**Mục tiêu:** có bộ test tự động kiểm tra luồng từ đầu đến cuối bằng API (không cần mở trình duyệt), bám `DAC_TA.md` mục 10 (Tiêu chí nghiệm thu).

**Việc cần làm**
1. Tạo `server/tests/acceptance.test.js`, dùng cách khởi động app giống `api.test.js`.
2. Mỗi tiêu chí nghiệm thu một khối `describe`. Test của phần chưa làm đánh dấu `{ todo: 'TVx' }` để không làm đỏ.
3. Các luồng tối thiểu: tính giá món có topping → áp mã giảm giá → đặt đơn → đơn ở trạng thái `PENDING` → chuyển trạng thái → hủy đơn đang giao bị `409` → đăng nhập admin → sửa menu bị chặn khi là nhân viên.
4. Thêm lệnh `npm run test:acceptance` vào `package.json` gốc.

**File được sửa:** `server/tests/acceptance.test.js`, `package.json`
**Xong khi:** file chạy được, mỗi tiêu chí có ít nhất 1 test, phần chưa làm là `todo`. Mỗi lần ai đó xong task, họ bỏ `todo` của test tương ứng.

---

### B2 — TV2: Menu điện thoại và rà responsive

**Mục tiêu:** web dùng tốt trên màn hình 360px (điện thoại).

**Việc cần làm**
1. `components/Layout.jsx`: thêm nút hamburger, bấm mở/đóng menu điều hướng trên màn hình hẹp. Đóng menu khi chuyển trang.
2. `styles.css`: rà toàn bộ trang theo 3 mốc 360 / 768 / 1280px. Sửa chỗ tràn ngang, chữ bị cắt, nút quá nhỏ (chạm tối thiểu 44px).
3. Kiểm tra các trang: Home, Menu, DrinkDetail, Cart, Checkout, OrderTracking, `/admin`.
4. Chụp ảnh trước/sau cho từng trang (dùng DevTools của trình duyệt) và đặt vào mô tả PR.

**File được sửa:** `client/src/components/Layout.jsx`, `client/src/styles.css`
**Xong khi:** không còn thanh cuộn ngang ở 360px; menu hamburger dùng được bằng bàn phím.

---

### C2 — TV2: Bộ giao diện dùng chung (Toast, Skeleton, ô báo lỗi)

**Mục tiêu:** các trang có cách hiển thị loading, lỗi, thông báo thống nhất, giúp mọi người dùng lại thay vì tự viết.

**Việc cần làm**
1. `components/Toast.jsx` + hook `useToast`: hiện thông báo ngắn góc màn hình, tự biến mất sau 3 giây.
2. `components/Skeleton.jsx`: khung xám nhấp nháy khi đang tải (thẻ món, dòng giỏ hàng).
3. `components/ErrorBox.jsx`: hiển thị lỗi bằng tiếng Việt kèm nút "Thử lại".
4. `components/EmptyState.jsx`: trạng thái rỗng (giỏ trống, không có đơn) kèm nút gợi ý hành động.
5. Áp dụng cho trang Menu và trang chi tiết món (hai trang đã chạy được). **Không** sửa trang của người khác; họ tự dùng lại sau.
6. Viết ví dụ dùng ở đầu mỗi file component (5–10 dòng chú thích).

**File được sửa:** `client/src/components/*` (file mới), `Menu.jsx`, `DrinkDetail.jsx`, `styles.css`
**Xong khi:** Menu hiện Skeleton khi tải và ErrorBox khi tắt server; Toast gọi được từ bất kỳ trang nào.

---

### B3 — TV3: Bộ kiểm tra dữ liệu đầu vào dùng chung (validators)

**Mục tiêu:** một nơi duy nhất kiểm tra tên, số điện thoại, địa chỉ, ghi chú theo BR11 (họ tên ≥ 2 ký tự, SĐT khớp `^(0|\+84)(3|5|7|8|9)\d{8}$`, địa chỉ ≥ 10 ký tự sau khi bỏ khoảng trắng hai đầu), để TV1 (Facade), TV5 (Chain) và form Checkout cùng dùng.

**Việc cần làm**
1. `server/src/utils/validators.js`: các hàm thuần `validatePhone`, `validateName`, `validateAddress`, `validateNote`. Mỗi hàm trả `{ ok: true }` hoặc `{ ok: false, field, message }` (tiếng Việt).
2. Số điện thoại Việt Nam: 10 số, bắt đầu 03, 05, 07, 08, 09; chấp nhận `+84` và chuẩn hóa về `0...`. Quy tắc gốc ở `DAC_TA.md` mục BR11; nếu đặc tả và code mâu thuẫn, báo trưởng nhóm. Giờ mở cửa (BR14) không thuộc task này.
3. `server/tests/validators.test.js`: tối thiểu 12 test (đúng, sai, biên, khoảng trắng đầu cuối).
4. Bản dùng cho trình duyệt: `client/src/utils/validators.js` có cùng quy tắc (copy logic, chú thích "phải giữ khớp với bản server").
5. Chưa nối vào form Checkout (đó là việc của TV1/TV5). Chỉ cung cấp hàm và test.

**File được sửa:** `server/src/utils/validators.js`, `client/src/utils/validators.js`, `server/tests/validators.test.js`
**Xong khi:** test PASS; viết 5–8 dòng hướng dẫn dùng ở đầu file để TV1, TV5 import.

---

### C3 — TV3: Mở rộng menu mẫu và script kiểm tra dữ liệu

**Mục tiêu:** menu đủ phong phú để demo, và có công cụ phát hiện lỗi dữ liệu.

**Việc cần làm**
1. Thêm tối thiểu **8 món** vào `server/src/data/drinks.json` (đủ 4 danh mục hiện có, ít nhất 2 món đánh dấu bán chạy). Giữ đúng cấu trúc các món đã có.
2. Tạo ảnh minh họa SVG đơn giản (màu theo danh mục) hoặc để `image: null` nếu `DrinkThumb` đã vẽ thay.
3. Viết `server/scripts/check-data.js`: kiểm tra id không trùng, `categoryId` tồn tại, `basePrice` là số nguyên dương, topping có giá hợp lệ, tài khoản không để mật khẩu thô. In ra danh sách lỗi và thoát mã khác 0 nếu có lỗi.
4. Thêm lệnh `npm run check-data -w server` vào `server/package.json`.
5. **Không** sửa file `users.json` (TV4 sở hữu), chỉ đọc.

**File được sửa:** `server/src/data/drinks.json`, `server/scripts/check-data.js`, `server/package.json`
**Xong khi:** `npm test` vẫn xanh (test hiện có không phụ thuộc số món), script chạy báo "Dữ liệu hợp lệ".

---

### B4 — TV4: Middleware bảo mật (header, giới hạn tần suất)

**Mục tiêu:** API có lớp bảo vệ cơ bản, không thêm thư viện ngoài.

**Việc cần làm**
1. `server/src/middlewares/securityHeaders.js`: đặt các header `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
2. `server/src/middlewares/rateLimit.js`: giới hạn số request theo IP trong cửa sổ thời gian, lưu trong bộ nhớ (Map). Cấu hình qua tham số `{ windowMs, max }`. Vượt giới hạn trả `429` + thông báo tiếng Việt.
3. Gắn `securityHeaders` cho toàn bộ app. Gắn `rateLimit` chặt hơn (5 lần / 1 phút) cho `/api/admin/login` khi route này có (TV4 làm ở Sprint 2; tạm chuẩn bị sẵn và viết test độc lập).
4. `server/tests/security.test.js`: kiểm tra header có mặt; kiểm tra lần thứ `max + 1` nhận `429`; kiểm tra hết cửa sổ thì được dùng lại (dùng đồng hồ giả hoặc cửa sổ rất ngắn).
5. Dọn bộ nhớ: tránh Map phình mãi (xóa bản ghi hết hạn).

**File được sửa:** `server/src/middlewares/*` (file mới), `server/src/app.js` (chỉ thêm `app.use` cho `securityHeaders`), `server/tests/security.test.js`
**Xong khi:** test PASS và `curl -i /api/health` thấy các header bảo mật.

---

### C4 — TV4: Bộ gọi thử API và test API bổ sung

**Mục tiêu:** ai cũng thử API nhanh được mà không cần viết lệnh `curl`.

**Việc cần làm**
1. Tạo `docs/api.http` (định dạng REST Client của VS Code): mỗi endpoint trong `docs/API.md` có một khối gọi mẫu, dùng biến `@host = http://localhost:3001/api`. Đánh dấu endpoint chưa làm bằng chú thích `# S1`, `# S2`.
2. Thêm 6 test API vào `server/tests/api.test.js` cho các endpoint **đã chạy** (`/categories`, `/drinks` kèm lọc, `/toppings`, `/options`, `404` cho id không có, định dạng lỗi `{ error }`).
3. Viết `docs/HUONG_DAN_API.md` (nửa trang): cài tiện ích REST Client, cách gọi thử, cách lấy token admin (từ Sprint 2).

**File được sửa:** `docs/api.http`, `docs/HUONG_DAN_API.md`, `server/tests/api.test.js` (chỉ thêm test, không sửa test cũ)
**Xong khi:** mở `api.http` bấm "Send Request" gọi được các endpoint đã chạy.

---

### B5 — TV5: Bảng test case thủ công

**Mục tiêu:** có danh sách test để cả nhóm chạy tay trước mỗi buổi demo và đưa vào báo cáo.

**Việc cần làm**
1. Tạo `docs/TEST_CASES.md` với bảng tối thiểu **30 test case**: Mã (TC01…) · Chức năng · Các bước · Kết quả mong đợi · Ánh xạ (BRxx hoặc tiêu chí nghiệm thu) · Kết quả (⬜ chưa chạy).
2. Phủ: chọn món/topping, giỏ hàng, mã giảm giá (đúng, hết hạn, chưa đủ tối thiểu), đặt đơn (thiếu thông tin, ngoài giờ), thanh toán (COD, MoMo, VNPay thành công / hủy), theo dõi đơn, quản trị (đúng/sai quyền), giao diện điện thoại.
3. Mỗi quy tắc nghiệp vụ BR01–BR23 phải được ít nhất một test case nhắc tới. Thêm bảng "BR → test case" ở cuối.
4. Thêm cột "Người chạy" và "Ngày" để điền khi kiểm thử.

**File được sửa:** `docs/TEST_CASES.md`
**Xong khi:** đủ 30 test case, không còn BR nào chưa được phủ.

---

### C5 — TV5: Trang tra cứu đơn theo mã và số điện thoại

**Mục tiêu:** khách xem lại đơn của mình mà không cần tài khoản.

**Việc cần làm**
1. API `GET /api/orders/lookup?id=DH004&phone=0912345678`: trả đơn nếu mã đơn và số điện thoại khớp. Sai số điện thoại hoặc không có đơn cùng trả `404` "Không tìm thấy đơn hàng" (không để lộ đơn có tồn tại hay không).
2. Đặt route **trước** `GET /:id` trong `server/src/routes/order.routes.js` để không bị nuốt.
3. Trang `client/src/pages/OrderLookup.jsx` tại `/orders/lookup`: form 2 ô, hiển thị kết quả và nút "Xem tiến trình" dẫn tới `/orders/:id`. Thêm route trong `App.jsx` và liên kết nhỏ ở Footer/Header.
4. Test API: khớp, sai số điện thoại, sai mã, thiếu tham số (`400`).
5. Bổ sung endpoint vào `docs/API.md` (mục Sprint 1).
6. Phụ thuộc: cần `orderRepository` đã dùng được (task chính Sprint 1 của TV5). Làm sau khi xong task chính.

**File được sửa:** `server/src/routes/order.routes.js`, `client/src/pages/OrderLookup.jsx`, `client/src/App.jsx`, `docs/API.md`, `server/tests/api.test.js` (thêm)
**Xong khi:** tra cứu được đơn mẫu từ giao diện; test PASS.

---

## 5. Thứ tự gợi ý và chống dẫm chân

| Tuần | Nên làm | Lý do |
|---|---|---|
| Tuần 1 Sprint 1 | Task chính Sprint 1; **B1** (TV1) làm ngay vì ảnh hưởng cả nhóm | CI và CODEOWNERS có sớm thì mọi PR sau đều được kiểm tra |
| Tuần 2 Sprint 1 | Hết task chính thì làm B2–B5 | Độc lập nhau, làm song song được |
| Sprint 2 | Task chính Sprint 2; xen kẽ C1–C5 | C1 và C5 nên làm sau khi task chính liên quan đã merge |

**Chỗ dễ xung đột:** `styles.css` (B2, C2 của TV2 và các trang khác), `api.test.js` (C4, C5), `App.jsx` (C5), `app.js` (B4). Quy ước: chỉ **thêm** phần mới ở cuối file hoặc trong khối của mình, không sắp xếp lại, không format lại cả file. Xung đột thì người mở PR sau tự giải quyết.

**Tiến độ chấp nhận:** ai trễ task bổ sung thì bỏ qua, không được làm ảnh hưởng task chính. Task chính luôn ưu tiên cao hơn.
