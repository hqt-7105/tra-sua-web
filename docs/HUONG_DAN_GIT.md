# Hướng dẫn Git cho nhóm

Quy ước chung (tên nhánh, commit, PR) ở `docs/QUY_UOC.md`. Tài liệu này là **cách làm từng bước** và **cách gỡ rối**.

## 1. Quy trình một task: clone → nhánh → PR

```bash
# Lần đầu
git clone https://github.com/hqt-7105/tra-sua-web.git
cd tra-sua-web
npm install

# Mỗi task
git checkout dev
git pull                                   # lấy code mới nhất
git checkout -b feature/tv3-adapter        # nhánh riêng, tạo từ dev
# ... code, chạy thử ...
npm test                                   # không có FAIL mới commit
git add server/src/patterns/structural/PaymentAdapter.js server/tests/adapter.test.js
git commit -m "feat(adapter): cài MomoAdapter dịch resultCode về PaymentResult"
git push -u origin feature/tv3-adapter     # lần đầu cần -u, các lần sau chỉ git push
```

Lên GitHub → **Compare & pull request** → base `dev`, compare nhánh của mình → điền mẫu PR → tạo.
CI (`.github/workflows/test.yml`) tự chạy `npm test`; người review được gắn tự động theo `.github/CODEOWNERS`.
Có dấu ✅ xanh và 1 người duyệt thì mới merge. **Không push thẳng vào `dev` hay `main`.**

Mẹo: `git add <file cụ thể>` thay vì `git add .` để không lỡ commit file rác. Xem trước bằng `git status` và `git diff --staged`.

## 2. Giải quyết xung đột (conflict) từng bước

Xung đột xảy ra khi bạn và người khác cùng sửa một chỗ. Cách xử lý an toàn:

1. Cập nhật nhánh của mình từ `dev`:
   ```bash
   git checkout dev && git pull
   git checkout feature/tv3-adapter
   git merge dev
   ```
2. Git báo `CONFLICT (content): Merge conflict in client/src/styles.css`. Xem danh sách: `git status` (mục *both modified*).
3. Mở từng file, tìm đoạn:
   ```
   <<<<<<< HEAD
   phần của bạn
   =======
   phần đã có trên dev
   >>>>>>> dev
   ```
   Giữ lại nội dung đúng (thường là **cả hai** phần, ghép lại), xóa ba dòng đánh dấu `<<<<<<<`, `=======`, `>>>>>>>`.
   VS Code có nút *Accept Current / Incoming / Both* ngay trên đoạn xung đột.
4. Chạy `npm test` và mở trang liên quan để chắc không hỏng.
5. Đánh dấu đã xử lý và hoàn tất:
   ```bash
   git add client/src/styles.css
   git commit                     # Git tự điền "Merge branch 'dev' ..."
   git push
   ```
6. Rối quá muốn làm lại từ đầu: `git merge --abort` (trở về trạng thái trước khi merge).

Phòng tránh: pull `dev` thường xuyên; ở file dùng chung (`styles.css`, `App.jsx`, `api.test.js`) chỉ **thêm** vào cuối hoặc trong khối của mình, không sắp xếp lại hay format lại cả file.

## 3. Năm lỗi hay gặp

| # | Lỗi | Dấu hiệu | Cách xử lý |
|---|---|---|---|
| 1 | **Quên pull** trước khi làm | Push bị từ chối, hoặc PR có xung đột | `git checkout dev && git pull`, quay lại nhánh mình `git merge dev`, xử lý xung đột (mục 2) rồi `git push` |
| 2 | **Commit nhầm nhánh** (ví dụ đang ở `dev`) | `git log` thấy commit của mình trên `dev` local | Chưa push: `git branch feature/tv3-adapter` (giữ commit sang nhánh mới), rồi `git checkout dev && git reset --keep origin/dev`, `git checkout feature/tv3-adapter`. Đã push lên `dev`: báo trưởng nhóm, **không** tự `--force` |
| 3 | **Push bị từ chối** (`rejected ... fetch first`) | Nhánh trên GitHub có commit mà máy bạn chưa có | `git pull` (hoặc `git pull --rebase` nếu chỉ mình làm nhánh đó), xử lý xung đột, `git push`. **Không** dùng `git push --force` |
| 4 | **Xung đột ở `package-lock.json`** | Conflict trong file lock rất dài | Đừng sửa tay: `git checkout --theirs package-lock.json` (lấy bản của `dev`), chạy `npm install` để Git tự cập nhật lại theo `package.json`, rồi `git add package-lock.json` và commit |
| 5 | **Lỡ commit `node_modules`** (hoặc `dist/`, `.env`) | PR có hàng nghìn file | `git rm -r --cached node_modules`, kiểm tra `.gitignore` có `node_modules/`, commit lại. Nếu là file chứa mật khẩu/token: đổi mật khẩu ngay và báo nhóm, vì lịch sử Git vẫn còn |

## 4. Lệnh hay dùng

| Việc | Lệnh |
|---|---|
| Xem đang ở nhánh nào, file nào đổi | `git status` |
| Xem lịch sử gọn | `git log --oneline --graph -15` |
| Bỏ thay đổi chưa commit của một file | `git restore <file>` |
| Bỏ file khỏi vùng chuẩn bị commit | `git restore --staged <file>` |
| Sửa lời nhắn commit cuối (chưa push) | `git commit --amend` |
| Cất tạm thay đổi để đổi nhánh | `git stash` → sau đó `git stash pop` |

Không dùng `git push --force`, `git reset --hard` trên nhánh người khác, và không xóa nhánh của người khác (xem `CLAUDE.md` mục 5).
