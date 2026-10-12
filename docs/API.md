# Hợp đồng API

Base URL khi dev: `http://localhost:3001/api` (frontend gọi `/api/...`, Vite tự chuyển tiếp).
Lỗi luôn có dạng `{ "error": "Thông báo tiếng Việt" }`. Mọi response có header bảo mật `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`. Lỗi kiểm tra dữ liệu (400) có thêm `"field"` cho biết ô nào sai.
Route `/admin/*` (trừ `/admin/login`) cần header `Authorization: Bearer <token>`.

| Method | Endpoint | Trạng thái | Phụ trách |
|---|---|---|---|
| GET | `/health` | ✅ Xong | — |
| GET | `/categories` | ✅ Xong | — |
| GET | `/drinks?categoryId=&bestSeller=true&q=` | ✅ Xong (Factory Method) | TV1 |
| GET | `/drinks/:id` | ✅ Xong (Factory Method) | TV1 |
| GET | `/toppings` | ✅ Xong | — |
| GET | `/options` | ✅ Xong | — |
| POST | `/cart/price` | ✅ Xong (Builder) | TV3 |
| GET | `/vouchers` | ✅ Xong | TV4 |
| POST | `/vouchers/validate` | ✅ Xong (Strategy) | TV4 |
| GET | `/orders/:id` | ✅ Xong (State) | TV5 |
| PATCH | `/orders/:id/status` | ✅ Xong (State) | TV5 |
| POST | `/orders` | ✅ Xong (Facade) | TV1 |
| GET | `/orders/:id/events` | ✅ Xong (Observer, SSE) | TV2 |
| GET | `/payments/methods` | ✅ Xong | TV3 |
| POST | `/payments/confirm` | ✅ Xong (Adapter) | TV3 |
| POST | `/admin/login`, `/admin/logout` · GET `/admin/me` | ✅ Xong | TV4 |
| GET/POST | `/admin/drinks`, `/admin/toppings` | ✅ Xong (Proxy) | TV4 |
| PUT/DELETE | `/admin/drinks/:id`, `/admin/toppings/:id` | ✅ Xong (Proxy) | TV4 |
| GET | `/admin/audit-log` | ✅ Xong | TV4 |
| GET | `/admin/orders?status=` | ✅ Xong | TV5 |
| PATCH | `/admin/orders/:id/status` | ✅ Xong (State + Observer) | TV5 |
| GET | `/admin/events` | ✅ Xong (Observer, SSE) | TV2 |


---

## Đã có

### `GET /drinks/:id`
```json
{
  "id": "ts-truyen-thong",
  "categoryId": "tra-sua",
  "name": "Trà sữa truyền thống",
  "basePrice": 35000,
  "description": "Hồng trà đậm vị pha sữa béo nhẹ, công thức nhà làm.",
  "image": "/images/drinks/ts-truyen-thong.svg",
  "isBestSeller": true,
  "isActive": true
}
```
Mỗi món còn có thêm phần do loại đồ uống tự mô tả (Factory Method, TV1), cả ở `GET /drinks`:
```json
{ "categoryName": "Trà sữa", "customization": { "allowToppings": true, "allowSugar": true, "allowIce": true } }
```

### `GET /options`
```json
{
  "sizes": [{ "id": "M", "name": "Size M", "extraPrice": 0 }, { "id": "L", "name": "Size L", "extraPrice": 6000 }],
  "sugarLevels": [0, 30, 50, 70, 100],
  "iceLevels": [0, 30, 50, 70, 100],
  "defaults": { "size": "M", "sugar": 100, "ice": 100, "quantity": 1 }
}
```

---

## Sprint 1

### `POST /cart/price` — TV3
Request:
```json
{ "drinkId": "ts-truyen-thong", "size": "L", "sugar": 50, "ice": 70,
  "toppingIds": ["tran-chau-den", "pudding"], "quantity": 2, "note": "ít ngọt" }
```
Response `200`:
```json
{
  "drinkId": "ts-truyen-thong",
  "description": "Trà sữa truyền thống + Trân châu đen + Pudding trứng",
  "size": "L", "sugar": 50, "ice": 70,
  "toppings": [{ "id": "tran-chau-den", "name": "Trân châu đen", "price": 5000 },
               { "id": "pudding", "name": "Pudding trứng", "price": 7000 }],
  "quantity": 2, "note": "ít ngọt",
  "unitPrice": 53000, "totalPrice": 106000
}
```
Lỗi: `404` món/topping không tồn tại · `400` size, đường, đá, số lượng không hợp lệ.
`400` luôn kèm `field` (`drinkId`, `size`, `sugar`, `ice`, `toppingIds`, `quantity`, `note`). Số lượng 1–20 (BR13), ghi chú tối đa 200 ký tự.
Loại đồ uống không cho phép cũng trả `400`: cà phê thêm topping (`toppingIds`), đá xay chỉnh mức đá (`ice`), xem `customization` ở `GET /drinks/:id`.
Món không chỉnh được mức đá (đá xay) trả `"ice": null` (không áp dụng); gửi lên `ice` mặc định (100) hoặc bỏ trống đều được.
Thiếu `size`/`sugar`/`ice`/`quantity`/`note` thì dùng mặc định (BR03). Giá luôn do server tính, mọi trường giá gửi lên bị bỏ qua.

### `POST /vouchers/validate` — TV4
Request: `{ "code": "MAY10", "subtotal": 100000, "shippingFee": 15000 }`
Response `200`:
```json
{ "code": "MAY10", "type": "percent", "discount": 10000, "total": 105000,
  "message": "Giảm 10% (tối đa 20.000đ)" }
```
Lỗi: `404` mã không tồn tại · `400` hết hạn, hết lượt, chưa đủ giá trị đơn tối thiểu · `400` + `field` (`code`, `subtotal`, `shippingFee`) khi dữ liệu gửi lên sai kiểu.
Mã không phân biệt hoa thường. Thiếu `shippingFee` thì server dùng `config.shippingFee`.

### `GET /vouchers` — TV4
Các mã còn dùng được (chưa hết hạn, còn lượt), dùng cho mục Khuyến mãi ở trang chủ.
```json
[{ "code": "MAY10", "type": "percent", "message": "Giảm 10% (tối đa 20.000đ)", "minOrder": 50000, "expiresAt": "2026-12-31T23:59:59+07:00" }]
```

Mẫu `server/src/data/vouchers.json` (thêm `HETLUOT` có `usageLimit`/`usedCount` để thử lỗi hết lượt):
```json
[
  { "code": "MAY10", "type": "percent", "value": 10, "maxDiscount": 20000, "minOrder": 50000, "expiresAt": "2026-12-31T23:59:59+07:00" },
  { "code": "GIAM20K", "type": "fixed", "value": 20000, "minOrder": 80000, "expiresAt": "2026-12-31T23:59:59+07:00" },
  { "code": "FREESHIP", "type": "freeship", "minOrder": 99000, "expiresAt": "2026-12-31T23:59:59+07:00" },
  { "code": "HETHAN", "type": "fixed", "value": 10000, "minOrder": 0, "expiresAt": "2025-01-01T00:00:00+07:00" }
]
```

### `GET /orders/:id` — TV5
Response `200`:
```json
{
  "id": "DH001", "customerName": "Nguyễn An", "items": [], "total": 47000,
  "createdAt": "2026-10-12T09:00:00.000Z",
  "status": "PENDING",
  "allowedActions": ["next", "cancel"],
  "history": []
}
```
Lỗi: `404` không có đơn.

### `PATCH /orders/:id/status` — TV5
Request: `{ "action": "next" }` hoặc `{ "action": "cancel" }`
Response `200`: đơn sau khi chuyển (cùng dạng `GET`).
Lỗi: `400` action lạ · `404` không có đơn · `409` chuyển trạng thái không hợp lệ (ví dụ hủy đơn đang giao).
Thành công thì phát sự kiện `STATUS_CHANGED` (Sprint 2, Observer).

---

## Sprint 2

### `POST /orders` — TV1 (Facade)
Request:
```json
{
  "customer": { "name": "Nguyễn An", "phone": "0912345678", "address": "12 Nguyễn Huệ, Quận 1", "note": "Gọi trước khi giao" },
  "items": [
    { "drinkId": "ts-truyen-thong", "size": "L", "sugar": 50, "ice": 70, "toppingIds": ["tran-chau-den"], "quantity": 2, "note": "" }
  ],
  "voucherCode": "MAY10",
  "paymentMethod": "MOMO"
}
```
Response `201`:
```json
{
  "order": {
    "id": "DH004", "customerName": "Nguyễn An", "phone": "0912345678", "address": "12 Nguyễn Huệ, Quận 1",
    "items": [ { "drinkId": "ts-truyen-thong", "description": "Trà sữa truyền thống + Trân châu đen", "size": "L", "quantity": 2, "unitPrice": 46000, "totalPrice": 92000 } ],
    "subtotal": 92000, "shippingFee": 15000, "discount": 9200, "total": 97800,
    "voucherCode": "MAY10", "paymentMethod": "MOMO", "paymentStatus": "PENDING",
    "status": "PENDING", "allowedActions": ["next", "cancel"], "history": [], "createdAt": "..."
  },
  "payment": { "method": "MOMO", "status": "PENDING", "redirectUrl": "/payment/mock?gateway=momo&orderId=DH004&...", "message": "Thành công" }
}
```
Lỗi: `400` + `field` (BR10–BR14) · `404` mã giảm giá/món không tồn tại · `402` cổng từ chối tạo giao dịch (không tạo đơn).
`field` của chuỗi kiểm tra: `items`, `customer.name`, `customer.phone`, `customer.address`, `customer.note`, `paymentMethod`, `items[i].drinkId`, `items[i].toppingIds`, `items[i].quantity`, `store` (ngoài giờ 08:00–22:00).
Mã giảm giá hết hạn/chưa đủ tối thiểu → `400`. Mọi trường giá gửi lên bị bỏ qua (BR02). COD → `paymentStatus: "UNPAID"`, `payment.redirectUrl: null`.
Giờ giả lập để thử ngoài giờ: chạy server với biến môi trường `FAKE_HOUR=23`.

### `GET /orders/:id/events` — TV2 (Observer, SSE)
`Content-Type: text/event-stream`. Mỗi sự kiện:
```
event: order
data: {"type":"STATUS_CHANGED","orderId":"DH004","status":"PREPARING","from":"PENDING","to":"PREPARING","at":"..."}

```
`type` ∈ `ORDER_CREATED` | `STATUS_CHANGED` | `PAYMENT_UPDATED`. Server gửi `: ping` mỗi 25 giây.
`PAYMENT_UPDATED` có `status` và `paymentStatus` mới (khách hủy giao dịch → `CANCELLED` / `FAILED`). Đơn không có → `404` JSON, không mở luồng.

### `GET /payments/methods` — TV3
```json
[{ "id": "COD", "name": "Thanh toán khi nhận hàng" }, { "id": "MOMO", "name": "Ví MoMo" }, { "id": "VNPAY", "name": "VNPay" }]
```

### `POST /payments/confirm` — TV3 (Adapter)
Request (trang `/payment/mock` gửi lên toàn bộ query đã nhận, thêm kết quả):
```json
{ "gateway": "vnpay", "params": { "vnp_TxnRef": "DH004", "vnp_Amount": "9780000", "vnp_TmnCode": "MAYTEA01", "vnp_OrderInfo": "...", "vnp_SecureHash": "...", "vnp_ResponseCode": "00", "vnp_TransactionNo": "14123456" } }
```
Response `200`: `{ "orderId": "DH004", "status": "PENDING", "paymentStatus": "PAID" }`
Khách hủy (`resultCode=1006` / `vnp_ResponseCode=24`) → `{ "status": "CANCELLED", "paymentStatus": "FAILED" }`.
Lỗi: `400` chữ ký sai hoặc gateway lạ (thiếu `gateway` thì kèm `field: "gateway"`) · `400` cổng không khớp phương thức của đơn · `404` không có đơn.
Đơn đã xử lý thanh toán rồi (không còn `PENDING`) → `200` trả trạng thái hiện tại, không đổi gì (bấm lại nút ở cổng giả không làm hủy đơn đã trả tiền).

### `POST /admin/login` — TV4
Request `{ "email": "admin@may.vn", "password": "admin123" }`
Response `200`: `{ "token": "9f1c...", "user": { "id": 1, "email": "admin@may.vn", "name": "Quản trị viên", "role": "admin" } }`
Lỗi `401` "Email hoặc mật khẩu không đúng" (sai email hay sai mật khẩu đều cùng thông báo). Email không phân biệt hoa thường.
Sai quá 5 lần trong 1 phút từ cùng một IP → `429` "Bạn đăng nhập sai quá nhiều lần..." kèm header `Retry-After` (giây); đăng nhập đúng không bị tính.

`POST /admin/logout` (kèm token) → `204`, token hết hiệu lực. `GET /admin/me` → `{ id, email, name, role }`.
Mọi route `/admin/*` khác: thiếu/sai/hết hạn token (8 giờ) → `401` "Vui lòng đăng nhập"; sai vai trò → `403` "Bạn không có quyền thực hiện thao tác này".

### `/admin/drinks`, `/admin/toppings` — TV4 (Proxy)
| Method | Endpoint | Body | Quyền |
|---|---|---|---|
| GET | `/admin/drinks?includeInactive=true` | — | admin, staff |
| POST | `/admin/drinks` | `{ categoryId, name, basePrice, description, image, isBestSeller }` | admin |
| PUT | `/admin/drinks/:id` | các trường cần sửa | admin |
| DELETE | `/admin/drinks/:id` | — (ngừng bán, `isActive=false`) | admin |
| GET | `/admin/audit-log` | — | admin |

Topping tương tự với `{ name, price }`. Lỗi: `401` chưa đăng nhập · `403` sai quyền · `400` dữ liệu sai (BR19) · `404` không có.
`400` kèm `field`: `name` (rỗng), `basePrice`/`price` (không phải số nguyên ≥ 0), `categoryId` (không tồn tại), `description`, `image`, `isBestSeller`, `isActive`.
Món/topping mới có `id` tự sinh từ tên (`Trà sữa khoai môn` → `tra-sua-khoai-mon`), `isActive: true`. `PUT` với `{ "isActive": true }` để mở bán lại.
Thành công trả bản ghi sau khi đổi (`200`). Nhật ký mới nhất trước.
Nhật ký: `[{ "at": "...", "email": "admin@may.vn", "action": "updateDrink", "targetId": "ts-truyen-thong" }]`

### `/admin/orders` — TV5
- `GET /admin/orders?status=PENDING` → mảng đơn (cùng dạng `GET /orders/:id`), mới nhất trước.
- `PATCH /admin/orders/:id/status` body `{ "action": "next" | "cancel" }` → đơn sau khi đổi; `409` nếu không hợp lệ; phát `STATUS_CHANGED`.
- `status` lạ → `400` kèm `field: "status"`; action lạ → `400` kèm `field: "action"`; không có đơn → `404`. Quyền: admin và staff.

### `GET /admin/events?token=...` — TV2 (Observer, SSE)
Giống `/orders/:id/events` nhưng nhận sự kiện của **mọi** đơn. Token đi qua query vì `EventSource` không gửi được header.
