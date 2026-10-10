# CLAUDE.md — Luật làm việc với Claude trong dự án này

Dự án: website Mây Trà Sữa, đồ án môn Mẫu thiết kế, nhóm 5 người (TV1–TV5).
File này được Claude Code đọc tự động ở đầu mỗi phiên. Mọi thành viên dùng Claude trong repo này đều phải tuân theo.

## 0. Đọc trước khi làm

1. `docs/KE_HOACH.md` (bức tranh chung), `docs/DAC_TA.md` (yêu cầu, quy tắc BR01–BR23).
2. `docs/PHAN_CONG_SPRINT_1.md` / `PHAN_CONG_SPRINT_2.md` để biết task của người đang hỏi.
3. `docs/QUY_UOC.md` (git, commit, code), `docs/API.md` (hợp đồng API).
4. Mẫu chuẩn: `server/src/patterns/structural/ToppingDecorator.js` và `server/tests/decorator.test.js`.

Nếu người dùng chưa nói rõ mình là TV mấy, **hỏi trước** rồi mới làm.

## 1. Phạm vi: mỗi người chỉ sửa phần của mình

- Chỉ sửa file thuộc task của TV đang làm việc (xem bảng phân công). Muốn sửa file của người khác: **dừng lại và nói với người dùng** để báo nhóm.
- **Không đổi hợp đồng (contract)**: khối chú thích đầu file pattern, chữ ký hàm/lớp public, định dạng request/response trong `docs/API.md`. Nếu bắt buộc phải đổi, nêu rõ lý do, sửa test và docs trong cùng PR, và nhắc người dùng thông báo nhóm.
- **Không sửa** `server/src/integrations/*` (SDK giả lập, đã xong), `ToppingDecorator.js` (mẫu), trừ khi người dùng yêu cầu rõ.
- Không thêm thư viện mới nếu chưa hỏi. Test dùng `node:test` có sẵn.
- Không làm việc ngoài task (không "tiện tay" refactor, đổi tên, format lại file khác).

## 2. Cách làm một task pattern (Definition of Done)

Một task chỉ coi là xong khi đủ cả 5 điều:

1. Test chấp nhận của pattern **PASS**: đã bỏ `{ todo: 'TVx' }` và `npm test` không có FAIL.
2. Trang/API liên quan **chạy được** (đã thử thật bằng `npm run dev`, không chỉ chạy test).
3. File pattern có khối chú thích GoF đầy đủ (Vấn đề / Giải pháp / Cấu trúc GoF / Ví dụ) theo mẫu trong `QUY_UOC.md` mục 4.
4. Có `docs/patterns/<ten-pattern>.md`, mô phỏng theo `decorator.md`.
5. Đã xóa `TaskNotice` của phần mình và cập nhật cột "Trạng thái" trong `README.md` / `docs/API.md`.

Làm theo thứ tự: đọc hợp đồng → bỏ `todo` 1 test → làm cho PASS → lặp lại. Không viết hết code rồi mới chạy test.

## 3. Pattern phải là thật, không gắn gượng

- Pattern phải giải quyết đúng "Vấn đề" ghi trong khối chú thích, đúng vai trò GoF (Creator/Product, Subject/Proxy, Target/Adaptee…).
- Không thay pattern bằng `if/else`, `switch` dài, hoặc hàm tiện ích rồi đặt tên giống pattern.
- Mỗi người phải **giải thích được 2 pattern của mình**. Khi hoàn thành, Claude tóm tắt 3–5 câu "vì sao pattern này, vai trò từng lớp" để người dùng hiểu và tự trình bày. Không chỉ dán code.

## 4. Quy ước code (rút gọn từ QUY_UOC.md)

- Tên biến/hàm/lớp: **tiếng Anh**. Chú thích và thông báo lỗi cho người dùng: **tiếng Việt**.
- `PascalCase` cho lớp, `camelCase` cho hàm/biến, `UPPER_SNAKE_CASE` cho hằng số.
- Tiền là **số nguyên VND**; chỉ định dạng "35.000đ" ở giao diện bằng `formatPrice()`.
- Lỗi nghiệp vụ backend: `throw new HttpError(status, 'Thông báo tiếng Việt')`. Lỗi validate có thêm `field`.
- Frontend gọi API qua `client/src/api/client.js`, không gọi `fetch` trực tiếp trong component.
- Không để `console.log` thừa, code chết, hay đoạn bị comment-out.
- Mật khẩu chỉ lưu dạng băm (scrypt, `utils/password.js`). Không ghi bí mật, token, mật khẩu thật vào code hay commit.

## 5. Git

- Không bao giờ commit hay push trực tiếp vào `main` hoặc `dev`. Làm trên `feature/tvX-ten-viec` (từ `dev`).
- Commit message: `loại(phạm-vi): mô tả ngắn` với loại ∈ `feat | fix | test | docs | refactor | style`.
- Trước khi commit: chạy `npm test`. Có FAIL thì không commit.
- Không `git push --force`, không `git reset --hard`, không xóa nhánh của người khác.
- PR vào `dev`, dùng đúng mẫu `.github/pull_request_template.md`, cần 1 người khác duyệt.
- Claude chỉ commit/push khi người dùng yêu cầu.

## 6. Kiểm tra trước khi báo "xong"

- Chạy `npm test` và dán kết quả (số pass / todo / fail).
- Với giao diện: mở thử trên trình duyệt, kiểm tra cả màn hình điện thoại.
- Với API: gọi thử bằng `curl` đúng ví dụ trong `docs/API.md`.
- Báo cáo trung thực: phần nào chưa làm, test nào còn `todo`, điều gì chưa chắc. Không nói "xong" khi chưa chạy.

## 7. Khi gặp tình huống đặc biệt

- Yêu cầu của người dùng **mâu thuẫn** với `DAC_TA.md` hoặc hợp đồng: nêu rõ mâu thuẫn và hỏi, không tự chọn.
- Test của người khác đang đỏ: không sửa test cho xanh. Báo người dùng.
- `server/src/middlewares/auth.js` đang ở chế độ **tạm** (cho mọi request vào admin). Chỉ TV4 thay ở Sprint 2. Không ai khác động vào và không dùng nó làm căn cứ bảo mật.
- Thiếu thông tin hoặc task quá lớn: chia nhỏ và làm từng phần, báo lại phần đã xong.
