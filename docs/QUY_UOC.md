# Quy ước làm việc nhóm

## 1. Git

**Nhánh**
- `main`: bản ổn định, chỉ merge từ `dev` sau mỗi buổi demo.
- `dev`: nhánh tích hợp, mọi PR đi vào đây.
- `feature/tvX-ten-viec`: nhánh làm việc của từng người, ví dụ `feature/tv3-builder`.
- `fix/mo-ta-loi`: sửa lỗi.

**Không ai push thẳng vào `main` hoặc `dev`.**

**Quy trình mỗi ngày**
```bash
git checkout dev && git pull           # lấy code mới nhất
git checkout feature/tv3-builder
git merge dev                          # cập nhật nhánh của mình, xử lý xung đột sớm
# ... code ...
npm test                               # phải không có FAIL trước khi push
git add . && git commit -m "feat(builder): thêm setSize và kiểm tra size hợp lệ"
git push
```

**Commit message:** `loại(phạm-vi): mô tả ngắn`
- `feat`: tính năng mới · `fix`: sửa lỗi · `test`: thêm/sửa test · `docs`: tài liệu · `refactor`: sắp xếp lại code · `style`: CSS/giao diện
- Ví dụ: `feat(strategy): cài PercentDiscount có trần giảm tối đa`

## 2. Pull Request

Checklist khi tạo PR (copy vào mô tả PR):

```
- [ ] npm test không có FAIL, test của tôi đã bỏ `todo`
- [ ] Đã chạy thử trên trình duyệt
- [ ] File pattern có khối chú thích đầu file
- [ ] Đã viết docs/patterns/<ten-pattern>.md
- [ ] Đã xóa TaskNotice của phần mình
```

Người review kiểm tra: đúng hợp đồng (contract) trong file khung, pattern đúng cấu trúc GoF, đặt tên rõ ràng, không để `console.log` thừa.

## 3. Code

- **Tên biến, hàm, lớp: tiếng Anh.** Chú thích và thông báo lỗi cho người dùng: tiếng Việt.
- Lớp: `PascalCase` (`OrderItemBuilder`) · hàm/biến: `camelCase` · hằng số: `UPPER_SNAKE_CASE`.
- Mỗi lớp pattern nằm trong `server/src/patterns/<creational|structural|behavioral>/`.
- Giá tiền luôn là **số nguyên VND** (35000), chỉ định dạng "35.000đ" ở giao diện bằng `formatPrice()`.
- Backend báo lỗi nghiệp vụ bằng `throw new HttpError(400, 'Thông báo...')`.
- Frontend gọi API qua `client/src/api/client.js`, không gọi `fetch` trực tiếp trong component.

## 4. Mẫu chú thích đầu file pattern

```js
/**
 * ============================================================================
 * PATTERN: <Tên> (<Creational|Structural|Behavioral>) — PHỤ TRÁCH: TVx
 * ============================================================================
 * Vấn đề:      <không dùng pattern thì gặp khó khăn gì>
 * Giải pháp:   <pattern giải quyết thế nào>
 * Cấu trúc GoF:
 *   <Vai trò GoF> = <Lớp trong dự án>
 * Ví dụ sử dụng:
 *   ...
 * ============================================================================
 */
```

## 5. Test

- Backend: `npm test -w server` · Frontend (logic thuần): `npm test -w client` · Cả hai: `npm test`.
- Dùng `node:test` có sẵn của Node, không cần cài thêm thư viện.
- Test viết sẵn đang ở trạng thái `todo` (hiện `# TODO`, không làm đỏ). Làm xong thì xóa `{ todo: 'TVx' }` để test chạy thật.
- Mỗi pattern tối thiểu các test viết sẵn + 2 test API do mình viết thêm.
