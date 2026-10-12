# Prompt mẫu cho từng thành viên (dùng với Claude Code)

Cách dùng: clone repo, mở thư mục dự án trong Claude Code (nó tự đọc `CLAUDE.md`), rồi dán đúng prompt của mình.
Thay `<...>` bằng thông tin thật. Làm **một task một lần**, xong PR rồi mới sang task kế.

---

## Phần chung (đã nằm trong `CLAUDE.md`, không cần dán lại)

Claude sẽ tự hỏi bạn là TV mấy, chỉ sửa file thuộc task của bạn, không đổi hợp đồng của người khác.

---

## TV1 — Trưởng nhóm

**Task chính Sprint 1**
```
Tôi là TV1. Hãy làm Task 1 trong docs/PHAN_CONG_SPRINT_1.md: cài Factory Method (server/src/patterns/creational/DrinkFactory.js),
refactor GET /api/drinks và /api/drinks/:id dùng factory, và hoàn thiện trang Giỏ hàng (client/src/pages/Cart.jsx).
Làm theo thứ tự: đọc hợp đồng trong file khung, bỏ todo của từng test trong server/tests/factory.test.js, làm cho PASS, rồi mới làm giao diện.
Cuối cùng viết docs/patterns/factory-method.md và giải thích cho tôi vai trò từng lớp để tôi tự trình bày được.
```

**B1 — Hạ tầng nhóm**
```
Tôi là TV1. Hãy làm task B1 trong docs/PHAN_CONG_BO_SUNG.md: tạo .github/workflows/test.yml (chạy npm ci và npm test trên Node 22 cho PR vào dev và main),
.github/CODEOWNERS, docs/HUONG_DAN_GIT.md, và bảng "ai review cho ai" trong docs/QUY_UOC.md.
Username GitHub của các thành viên: TV1=<...>, TV2=<...>, TV3=<...>, TV4=<...>, TV5=<...>.
Chỉ sửa các file được liệt kê trong task.
```

**C1 — Test tích hợp**
```
Tôi là TV1. Hãy làm task C1 trong docs/PHAN_CONG_BO_SUNG.md: viết server/tests/acceptance.test.js bám mục 10 (Tiêu chí nghiệm thu) của docs/DAC_TA.md.
Phần chưa có chức năng thì đánh dấu { todo: 'TVx' } đúng người phụ trách. Thêm script npm run test:acceptance vào package.json gốc.
```

---

## TV2 — UI/UX

**Task chính Sprint 1**
```
Tôi là TV2. Hãy làm Task 2 trong docs/PHAN_CONG_SPRINT_1.md: cài Singleton CartStore (client/src/store/cartStore.js) cùng hook useCart,
hoàn thiện Landing page (client/src/pages/Home.jsx) và hiện số ly trên Header. Bỏ todo trong client/tests/cartStore.test.js từng test một.
Cuối cùng viết docs/patterns/singleton.md và giải thích cho tôi vì sao Singleton phù hợp với giỏ hàng.
```

**B2 — Responsive**
```
Tôi là TV2. Hãy làm task B2 trong docs/PHAN_CONG_BO_SUNG.md: thêm menu hamburger cho Layout.jsx và rà responsive 360/768/1280px trong styles.css
cho các trang Home, Menu, DrinkDetail, Cart, Checkout, OrderTracking, /admin. Chỉ thêm CSS ở khối mới, không sắp xếp lại file.
```

**C2 — Bộ giao diện dùng chung**
```
Tôi là TV2. Hãy làm task C2 trong docs/PHAN_CONG_BO_SUNG.md: tạo Toast + useToast, Skeleton, ErrorBox, EmptyState trong client/src/components,
áp dụng cho trang Menu và DrinkDetail. Mỗi component có chú thích ví dụ dùng ở đầu file.
```

---

## TV3 — Fullstack

**Task chính Sprint 1**
```
Tôi là TV3. Hãy làm Task 3 trong docs/PHAN_CONG_SPRINT_1.md: cài Builder (server/src/patterns/creational/OrderItemBuilder.js),
API POST /api/cart/price (dùng Builder kết hợp ToppingDecorator có sẵn) và form tùy chỉnh món trong client/src/pages/DrinkDetail.jsx.
Bỏ todo trong server/tests/builder.test.js từng test một. Cuối cùng viết docs/patterns/builder.md và giải thích vai trò Director/Builder/Product.
```

**B3 — Validators**
```
Tôi là TV3. Hãy làm task B3 trong docs/PHAN_CONG_BO_SUNG.md: viết server/src/utils/validators.js (validatePhone, validateName, validateAddress, validateNote)
theo BR11 trong docs/DAC_TA.md, bản trình duyệt tương ứng ở client/src/utils/validators.js, và server/tests/validators.test.js với ít nhất 12 test.
Chưa nối vào form Checkout.
```

**C3 — Dữ liệu mẫu**
```
Tôi là TV3. Hãy làm task C3 trong docs/PHAN_CONG_BO_SUNG.md: thêm ít nhất 8 món vào server/src/data/drinks.json (giữ đúng cấu trúc), viết server/scripts/check-data.js
kiểm tra tính hợp lệ của dữ liệu và thêm lệnh npm run check-data -w server. Không sửa users.json.
```

---

## TV4 — Backend, bảo mật

**Task chính Sprint 1**
```
Tôi là TV4. Hãy làm Task 4 trong docs/PHAN_CONG_SPRINT_1.md: cài Strategy (server/src/patterns/behavioral/DiscountStrategy.js),
tạo server/src/data/vouchers.json theo mẫu trong docs/API.md, API POST /api/vouchers/validate và ô nhập mã giảm giá ở trang Giỏ hàng/Checkout.
Bỏ todo trong server/tests/strategy.test.js từng test một. Cuối cùng viết docs/patterns/strategy.md và giải thích vì sao Strategy thay được chuỗi if/else.
```

**B4 — Bảo mật**
```
Tôi là TV4. Hãy làm task B4 trong docs/PHAN_CONG_BO_SUNG.md: viết middleware securityHeaders và rateLimit (không thêm thư viện),
gắn securityHeaders vào server/src/app.js, và viết server/tests/security.test.js. Giới hạn đăng nhập 5 lần mỗi phút sẽ gắn sau khi có route login ở Sprint 2.
```

**C4 — Bộ gọi thử API**
```
Tôi là TV4. Hãy làm task C4 trong docs/PHAN_CONG_BO_SUNG.md: tạo docs/api.http (REST Client của VS Code) cho mọi endpoint trong docs/API.md,
thêm 6 test API cho các endpoint đã chạy vào server/tests/api.test.js (chỉ thêm, không sửa test cũ) và viết docs/HUONG_DAN_API.md.
```

---

## TV5 — Backend, QA

**Task chính Sprint 1**
```
Tôi là TV5. Hãy làm Task 5 trong docs/PHAN_CONG_SPRINT_1.md: cài State (server/src/patterns/behavioral/OrderState.js),
repository đơn hàng (server/src/repositories/orderRepository.js) với vài đơn mẫu, API GET /api/orders/:id và PATCH /api/orders/:id/status,
và trang theo dõi đơn client/src/pages/OrderTracking.jsx. Bỏ todo trong server/tests/state.test.js từng test một.
Cuối cùng viết docs/patterns/state.md và giải thích sơ đồ trạng thái của đơn.
```

**B5 — Test case thủ công**
```
Tôi là TV5. Hãy làm task B5 trong docs/PHAN_CONG_BO_SUNG.md: viết docs/TEST_CASES.md với ít nhất 30 test case,
mỗi quy tắc BR01–BR23 trong docs/DAC_TA.md phải được ít nhất một test case nhắc tới, kèm bảng "BR → test case" ở cuối.
```

**C5 — Tra cứu đơn**
```
Tôi là TV5. Hãy làm task C5 trong docs/PHAN_CONG_BO_SUNG.md: API GET /api/orders/lookup?id=&phone= (đặt trước GET /:id), trang client/src/pages/OrderLookup.jsx
tại /orders/lookup, test API và cập nhật docs/API.md. Sai số điện thoại hay sai mã đều trả 404 cùng thông báo.
```

---

## Mẹo dùng Claude hiệu quả

- Dán **một prompt một lần**. Xong, chạy `npm test`, mở thử trên trình duyệt rồi mới commit.
- Nếu Claude muốn sửa file ngoài danh sách của task: dừng lại, hỏi trưởng nhóm.
- Yêu cầu Claude giải thích: *"Giải thích pattern này trong 5 câu để tôi trình bày 2 phút."* Mỗi người phải tự nói được pattern của mình khi bảo vệ.
- Kẹt quá 1 ngày thì nhắn nhóm, đừng chờ.
