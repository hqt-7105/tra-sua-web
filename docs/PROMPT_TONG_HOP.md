# Prompt tổng hợp — một mình chạy toàn bộ dự án bằng Claude Code

Dùng khi trưởng nhóm tự làm thay cả 5 thành viên. Mở Claude Code ở thư mục gốc dự án (nó tự đọc `CLAUDE.md`), rồi dán **khối prompt ở mục 1**.
Bảng tổng số task nằm ở mục 2.

> Lưu ý: `CLAUDE.md` có quy tắc "mỗi TV chỉ sửa phần của mình". Khi một mình làm hết, prompt dưới đây nêu rõ đang ở chế độ **trưởng nhóm làm thay toàn bộ** nên Claude được sửa file của mọi TV, nhưng vẫn phải giữ nguyên hợp đồng (contract), chú thích GoF và quy ước.

---

## 1. Prompt dán vào Claude Code

````
Bạn đang ở chế độ TRƯỞNG NHÓM LÀM THAY TOÀN BỘ 5 THÀNH VIÊN (TV1–TV5) của dự án này. Ngoại lệ này chỉ áp dụng cho phiên này:
bạn được sửa file của mọi TV, nhưng vẫn phải tuân thủ phần còn lại của CLAUDE.md và docs/QUY_UOC.md, không đổi hợp đồng (contract) trong file khung,
không sửa server/src/integrations/* và ToppingDecorator.js.

## Việc cần làm
Thực hiện lần lượt toàn bộ task trong:
- docs/PHAN_CONG_SPRINT_1.md (Task 1–5)
- docs/PHAN_CONG_SPRINT_2.md (Task 2.1–2.5)
- docs/PHAN_CONG_BO_SUNG.md (B1–B5, C1–C5)
Đọc trước: docs/KE_HOACH.md, docs/DAC_TA.md, docs/API.md, docs/QUY_UOC.md, server/src/patterns/structural/ToppingDecorator.js và server/tests/decorator.test.js (mẫu chuẩn).

## Thứ tự thực hiện (theo phụ thuộc, KHÔNG làm theo số thứ tự tài liệu)
Giai đoạn 1 — nền tảng, không phụ thuộc nhau:
  1. Task 4 (Strategy + vouchers + POST /vouchers/validate + ô nhập mã)
  2. Task 5 (State + orderRepository + GET/PATCH /orders/:id + OrderTracking)
  3. Task 1 (Factory Method + refactor /drinks + trang Giỏ hàng)
  4. Task 3 (Builder + POST /cart/price + form tùy chỉnh món)
  5. Task 2 (Singleton CartStore + useCart + Landing + số ly trên Header)
  6. B3 (validators dùng chung), C3 (menu mẫu + check-data)
Giai đoạn 2 — các pattern của Sprint 2 phụ thuộc giai đoạn 1:
  7. Task 2.5 phần Chain of Responsibility (dùng validators của B3)
  8. Task 2.3 (Adapter + thanh toán giả lập + /payment/mock)
  9. Task 2.2 (Observer + SSE + useOrderEvents)
  10. Task 2.4 (Proxy + đăng nhập + thay middleware auth TẠM + quản lý menu admin)
  11. Task 2.1 (Facade + POST /orders + trang Checkout) — làm SAU các bước 7–10 vì Facade gọi chúng
  12. Task 2.5 phần quản lý đơn admin (AdminOrders, GET/PATCH /admin/orders)
Giai đoạn 3 — chất lượng và hạ tầng:
  13. B4 (bảo mật), C4 (api.http + test API), C5 (tra cứu đơn)
  14. B2 (responsive, hamburger), C2 (Toast/Skeleton/ErrorBox/EmptyState)
  15. B1 (CI, CODEOWNERS, HUONG_DAN_GIT), B5 (TEST_CASES.md), C1 (acceptance test) — làm cuối để test bám hệ thống thật

## Quy trình cho MỖI task
1. Tạo nhánh từ dev: feature/<mã-task>-<tên-ngắn> (ví dụ feature/tv4-strategy). Một task một nhánh.
2. Pattern: đọc hợp đồng trong file khung → bỏ { todo: ... } của test tương ứng ĐÚNG MỘT TEST MỘT LẦN → làm cho PASS → lặp lại.
3. Làm backend trước, rồi giao diện. Giao diện phải chạy thử thật (npm run dev), kiểm tra cả khung 360px.
4. Đáp ứng Definition of Done trong CLAUDE.md mục 2: test PASS, chạy thật, chú thích GoF đầu file, docs/patterns/<ten>.md, xóa TaskNotice, cập nhật README/API.md.
5. Chạy npm test. Có FAIL thì sửa, không commit. Không sửa test của người khác cho xanh.
6. Commit theo định dạng loại(phạm-vi): mô tả (tiếng Việt). Có thể nhiều commit nhỏ trong một task.
7. Đẩy nhánh và mở PR vào dev bằng mẫu .github/pull_request_template.md. Nếu không có gh/không đẩy được, ghi lại rồi tiếp tục.
8. Merge nhánh vào nhánh tích hợp local trước khi bắt đầu task phụ thuộc (ví dụ merge Strategy + State trước khi làm Facade).
   Không push thẳng vào main hoặc dev.

## Quy tắc chất lượng (bắt buộc)
- Pattern phải thật, đúng vai trò GoF, không thay bằng if/else đặt tên giống pattern.
- Tiền là số nguyên VND. Lỗi nghiệp vụ dùng HttpError kèm field khi cần. Frontend gọi API qua client/src/api/client.js.
- Mật khẩu chỉ lưu dạng băm. Middleware auth tạm phải bị thay hoàn toàn ở bước 10, rồi kiểm tra lại /api/admin trả 401 khi chưa đăng nhập.
- Không thêm thư viện ngoài nếu chưa hỏi. Không để console.log thừa.
- Nếu yêu cầu mâu thuẫn với DAC_TA.md hoặc hợp đồng: dừng và hỏi tôi, không tự chọn.

## Mốc kiểm tra và báo cáo
Sau mỗi giai đoạn (1, 2, 3) dừng lại và báo ngắn gọn:
- Task đã xong / còn lại, kết quả npm test (pass / todo / fail), pattern đã cài.
- Việc chưa chắc hoặc đã bỏ qua và lý do.
- Điều tôi cần tự làm (ví dụ merge PR, điền username GitHub vào CODEOWNERS).
Chờ tôi nhắn "tiếp" rồi mới sang giai đoạn kế.

## Kết thúc
Khi xong cả 3 giai đoạn: chạy npm test (phải KHÔNG còn todo của task đã làm), chạy theo kịch bản demo 9 bước ở docs/DAC_TA.md mục 10,
chụp ảnh các trang chính, rồi tóm tắt cho tôi: bảng "Pattern → file → test → trạng thái" và 3–5 câu giải thích mỗi pattern để tôi trình bày.
````

---

## 2. Tổng số task của toàn đồ án

### Phần Claude Code làm theo prompt trên: **20 task**

| Nhóm | Số task | Mã | Nội dung |
|---|---|---|---|
| Sprint 1 — chính | 5 | 1, 2, 3, 4, 5 | Factory Method, Singleton, Builder, Strategy, State kèm API và giao diện |
| Sprint 2 — chính | 5 | 2.1 – 2.5 | Facade, Observer, Adapter, Proxy, Chain of Responsibility kèm đặt hàng, thanh toán, đăng nhập, quản trị |
| Bổ sung B | 5 | B1 – B5 | CI/CODEOWNERS, responsive, validators, bảo mật, test case thủ công |
| Bổ sung C | 5 | C1 – C5 | Test nghiệm thu, UI kit, menu mẫu, api.http, tra cứu đơn |

### Phần còn lại sau 20 task (Sprint 3, đề xuất): **6 task**

| Mã | Việc | Ai |
|---|---|---|
| D1 | Chạy toàn bộ `TEST_CASES.md` trên bản chạy thật, ghi kết quả, sửa lỗi tìm được | Cả nhóm |
| D2 | (Tùy chọn) Chuyển repository sang SQLite/MySQL theo ERD, script seed | TV3 |
| D3 | Báo cáo: đặc tả, sơ đồ UML (use case, lớp từng pattern, tuần tự, trạng thái, ERD), bảng "Pattern → file → người → test" | TV5 gom, mỗi người viết phần của mình |
| D4 | Slide thuyết trình, mỗi người chuẩn bị 2 phút cho 2 pattern của mình | TV2 làm khung |
| D5 | Quay video demo dự phòng và chạy thử demo trên máy trình bày trước 1 ngày | TV1 |
| D6 | Rà soát cuối: responsive, bảo mật `/api/admin`, bỏ hết `todo`, README hướng dẫn chạy | TV1 + TV4 |

### Tổng cộng: **26 task** (20 + 6), trong đó D2 là tùy chọn nên tối thiểu là **25 task**.

### Tiến độ theo pattern (11 pattern)

| Nhóm GoF | Pattern | Task |
|---|---|---|
| Creational | Factory Method · Singleton · Builder | 1 · 2 · 3 |
| Structural | Decorator (xong) · Facade · Adapter · Proxy | — · 2.1 · 2.3 · 2.4 |
| Behavioral | Strategy · State · Observer · Chain of Responsibility | 4 · 5 · 2.2 · 2.5 |

---

## 3. Mẹo khi chạy một mình

- **Chia nhỏ phiên.** Claude Code có giới hạn ngữ cảnh. Sau mỗi giai đoạn bạn có thể mở phiên mới và dán lại prompt kèm câu: *"Giai đoạn 1 đã xong và đã merge, tiếp tục giai đoạn 2."* `CLAUDE.md` và `docs/` giúp nó nắm lại bối cảnh.
- **Đọc lại từng PR.** Dù Claude làm, bạn là người phải bảo vệ đồ án. Sau mỗi task, nhờ Claude giải thích pattern trong 5 câu rồi tự nói lại bằng lời của mình.
- **Khi thành viên rảnh trở lại.** Giao lại các task chưa làm trong `PHAN_CONG_*`; mỗi task đều độc lập nên không phải chờ ai.
- **Quan trọng khi nộp bài:** nếu giảng viên yêu cầu mỗi người tự cài pattern, hãy bàn với nhóm cách ghi nhận phần đóng góp cho đúng thực tế.
