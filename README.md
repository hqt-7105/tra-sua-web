# 🧋 Mây Trà Sữa — Website đặt trà sữa áp dụng Design Patterns

Đồ án môn **Mẫu thiết kế**, nhóm 5 người. Landing page giới thiệu thương hiệu, kèm luồng đặt món:
chọn món → tùy chỉnh → giỏ hàng → mã giảm giá → đặt hàng → theo dõi trạng thái.

> Tên "Mây Trà Sữa" là tên tạm, nhóm đổi tùy ý.

## Công nghệ

- **Frontend:** React 18 + Vite + React Router (`client/`)
- **Backend:** Node.js + Express (`server/`), dữ liệu tạm bằng file JSON
- **Test:** `node:test` có sẵn trong Node, không cần thư viện ngoài

## Chạy dự án

Yêu cầu **Node.js 20 trở lên** (khuyên dùng 22 LTS).

```bash
npm install        # cài cho cả client và server (chạy ở thư mục gốc)
npm run dev        # chạy đồng thời backend :3001 và frontend :5173
```

Mở http://localhost:5173. Kiểm tra API: http://localhost:3001/api/health

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy cả hai |
| `npm run dev:server` / `npm run dev:client` | Chạy riêng từng phần |
| `npm test` | Chạy toàn bộ test |
| `npm test -w server` | Chỉ test backend |
| `npm run build` | Build frontend ra `client/dist` |

## Cấu trúc thư mục

```
tra-sua-web/
├── client/                    # React
│   ├── src/
│   │   ├── api/               # client.js (gọi API, token admin), useFetch.js
│   │   ├── components/        # Layout, DrinkCard, TaskNotice...
│   │   ├── hooks/             # useOrderEvents.js (Observer phía client - TV2)
│   │   ├── pages/             # Home, Menu, DrinkDetail, Cart, Checkout, PaymentMock, OrderTracking
│   │   │   └── admin/         # AdminLayout, AdminLogin, AdminOrders, AdminMenu
│   │   ├── store/             # cartStore.js (Singleton - TV2)
│   │   └── styles.css
│   └── tests/
├── server/                    # Express
│   ├── scripts/               # hash-password.js
│   ├── src/
│   │   ├── config.js          # phí ship, giờ mở cửa, phương thức thanh toán
│   │   ├── events.js          # instance Observer dùng chung
│   │   ├── data/              # JSON: danh mục, món, topping, tùy chọn, tài khoản demo
│   │   ├── domain/            # Drink (lớp gốc)
│   │   ├── integrations/      # SDK MoMo / VNPay GIẢ LẬP (Adaptee)
│   │   ├── middlewares/       # lỗi, xác thực
│   │   ├── patterns/
│   │   │   ├── creational/    # DrinkFactory, OrderItemBuilder
│   │   │   ├── structural/    # ToppingDecorator, OrderFacade, PaymentAdapter, MenuServiceProxy
│   │   │   └── behavioral/    # DiscountStrategy, OrderState, OrderEvents, OrderValidation
│   │   ├── repositories/      # đọc/ghi dữ liệu (menu, đơn hàng)
│   │   ├── routes/            # API
│   │   ├── services/          # authService, (voucherService, menuService... thành viên tạo)
│   │   └── utils/             # password.js (scrypt)
│   └── tests/
└── docs/
    ├── KE_HOACH.md            # kế hoạch tổng, lộ trình sprint, phân công tổng
    ├── DAC_TA.md              # đặc tả: use case, quy tắc nghiệp vụ, ERD, sơ đồ
    ├── PHAN_CONG_SPRINT_1.md  # task thứ nhất của từng thành viên
    ├── PHAN_CONG_SPRINT_2.md  # task thứ hai của từng thành viên
    ├── QUY_UOC.md             # git, commit, PR, code style
    ├── API.md                 # hợp đồng API
    └── patterns/              # giải thích từng pattern (mẫu: decorator.md)
```

## Bản đồ Design Pattern (11 pattern)

| Nhóm | Pattern | File | Phụ trách | Trạng thái |
|---|---|---|---|---|
| Creational | Factory Method | `server/src/patterns/creational/DrinkFactory.js` | TV1 | ⏳ Sprint 1 |
| Creational | Singleton | `client/src/store/cartStore.js` | TV2 | ⏳ Sprint 1 |
| Creational | Builder | `server/src/patterns/creational/OrderItemBuilder.js` | TV3 | ⏳ Sprint 1 |
| Structural | Decorator | `server/src/patterns/structural/ToppingDecorator.js` | — | ✅ Mẫu |
| Structural | Facade | `server/src/patterns/structural/OrderFacade.js` | TV1 | ⏳ Sprint 2 |
| Structural | Adapter | `server/src/patterns/structural/PaymentAdapter.js` | TV3 | ⏳ Sprint 2 |
| Structural | Proxy | `server/src/patterns/structural/MenuServiceProxy.js` | TV4 | ⏳ Sprint 2 |
| Behavioral | Strategy | `server/src/patterns/behavioral/DiscountStrategy.js` | TV4 | ⏳ Sprint 1 |
| Behavioral | State | `server/src/patterns/behavioral/OrderState.js` | TV5 | ⏳ Sprint 1 |
| Behavioral | Observer | `server/src/patterns/behavioral/OrderEvents.js` | TV2 | ⏳ Sprint 2 |
| Behavioral | Chain of Responsibility | `server/src/patterns/behavioral/OrderValidation.js` | TV5 | ⏳ Sprint 2 |

## Tài khoản demo (chỉ dùng khi phát triển)

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `admin@may.vn` | `admin123` | Quản trị: toàn quyền |
| `staff@may.vn` | `staff123` | Nhân viên: xử lý đơn, chỉ xem menu |

Trang quản trị: http://localhost:5173/admin

> ⚠️ Tới khi TV4 xong Sprint 2, `server/src/middlewares/auth.js` đang ở chế độ tạm, cho mọi request vào `/api/admin`.

## Bắt đầu từ đâu?

1. Đọc `docs/KE_HOACH.md` (bức tranh chung) và `docs/DAC_TA.md` (yêu cầu chi tiết).
2. Đọc `docs/PHAN_CONG_SPRINT_1.md` / `PHAN_CONG_SPRINT_2.md` để biết task của mình.
3. Đọc `ToppingDecorator.js` và `tests/decorator.test.js` để xem mẫu cách viết.
4. Mở file pattern của mình, đọc khối hợp đồng ở đầu file, rồi bỏ `todo` trong test tương ứng và code cho tới khi PASS.

<!-- thu khoa nhanh -->
