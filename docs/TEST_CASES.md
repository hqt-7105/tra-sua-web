# Bảng test case thủ công — Mây Trà Sữa

> B5 (TV5). Cả nhóm chạy tay trước mỗi buổi demo và đưa vào báo cáo. Quy tắc nghiệp vụ `BRxx` và tiêu chí nghiệm thu tra ở `docs/DAC_TA.md` (mục 4 và mục 10). Thông báo, nhãn nút và số tiền trong cột "Kết quả mong đợi" đã được đối chiếu với hệ thống chạy thật; nếu giao diện đổi chữ thì sửa bảng này cùng PR.
>
> **Chuẩn bị**
> - `npm run dev`, mở http://localhost:5173 ở Chrome (DevTools bật chế độ điện thoại khi cần).
> - Dữ liệu nằm trong bộ nhớ: dừng server (Ctrl+C) rồi chạy lại là về dữ liệu mẫu — đơn DH001 `PENDING` (SĐT 0912345678), DH002 `DELIVERING` (có Cà phê muối), DH003 `CANCELLED`.
> - Tài khoản: `admin@may.vn / admin123`, `staff@may.vn / staff123`.
> - Quán chỉ nhận đơn 08:00 – trước 22:00 (giờ Việt Nam). Chạy thử ngoài giờ đó thì đặt giờ giả bằng biến môi trường `FAKE_HOUR` (server đọc ở `server/src/services/orderFacadeInstance.js`): Git Bash `FAKE_HOUR=10 npm run dev`; PowerShell `$env:FAKE_HOUR=10; npm run dev` (biến còn tới khi đóng cửa sổ, bỏ bằng `Remove-Item Env:FAKE_HOUR`).
> - Món dùng để có tạm tính chẵn: **Cà phê đen đá** (`/menu/cf-den-da`), size M, 25.000đ/ly, không có topping.
> - Chạy **TC40 sau cùng**: sau lần sai thứ 5 trong 1 phút, mọi lần đăng nhập (kể cả đúng) bị chặn 1 phút.
>
> **Ghi kết quả:** ⬜ chưa chạy · ✅ đạt · ❌ lỗi (ghi mã lỗi/issue vào cột Kết quả). Điền cột Người chạy và Ngày.

## 1. Chọn món và tùy chỉnh

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC01 | Trang chủ | Mở `/` | Có hero, nút "Đặt ngay", mục **Món bán chạy** lấy từ API, mục "Khuyến mãi tuần này" (có MAY10), giờ mở cửa | UC01 | ⬜ | | |
| TC02 | Lọc và tìm món | `/menu` → chọn tab "Trà sữa"; gõ `MATCHA` vào ô "Tìm món..." | Chỉ còn "Trà sữa Matcha" (gõ chữ hoa vẫn ra); món ngừng bán không hiện | UC02, BR23 | ⬜ | | |
| TC03 | Tìm không có kết quả | `/menu` → gõ `xyzabc` | Hiện "Không tìm thấy món phù hợp" và nút "Xem tất cả món"; bấm nút thì ô tìm được xóa, hiện lại đủ 19 món | UC02 | ⬜ | | |
| TC04 | Lựa chọn mặc định | Mở `/menu/ts-truyen-thong` | Đang chọn Size M, đường 100%, đá 100%, số lượng 1; thành tiền 35.000đ | BR03 | ⬜ | | |
| TC05 | Tính giá món có topping | Ở TC04 chọn Size L, đường 50%, đá 70%, thêm Trân châu đen + Pudding trứng, số lượng 2 | Đơn giá 53.000đ (35.000 + 6.000 + 5.000 + 7.000), thành tiền **106.000đ**, tiền hiển thị dạng "106.000đ" | BR01, BR02, tiêu chí 1 | ⬜ | | |
| TC06 | Cùng topping nhiều lần | Mở lại `/menu/ts-truyen-thong`, bấm "+" ở Trân châu đen 2 lần | Thành tiền 45.000đ (35.000 + 5.000 × 2) | BR04 | ⬜ | | |
| TC07 | Quy tắc theo loại đồ uống | Mở `/menu/cf-sua-da`, rồi `/menu/dx-cookie` | Cà phê: không có phần topping, hiện "Cà phê pha theo công thức, không thêm topping."; đá xay: không có phần mức đá, hiện "Đá xay xay cùng đá theo công thức, không chỉnh mức đá." | BR03 | ⬜ | | |
| TC08 | Giới hạn số lượng | `/menu/cf-den-da` → bấm "+" số lượng liên tục → "Thêm vào giỏ" 2 lần | Số lượng dừng ở 20, nút "+" bị mờ; lần thêm thứ 2 báo "Giỏ đã có 20 ly món này (tối đa 20 ly mỗi món)." | BR13 | ⬜ | | |

## 2. Giỏ hàng

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC09 | Gộp dòng giống nhau | Thêm 2 lần cùng tổ hợp ở TC05 nhưng số lượng 1 mỗi lần → `/cart` | Giỏ có **1 dòng**, số lượng 2; số trên nút Giỏ hàng ở header là 2 | BR05, tiêu chí 2 | ⬜ | | |
| TC10 | Giỏ còn khi tải lại | Ở TC09 nhấn F5 | Giỏ giữ nguyên 1 dòng, số lượng 2 | BR05, tiêu chí 2 | ⬜ | | |
| TC11 | Khác tùy chọn thì tách dòng | Giỏ trống → thêm Trà sữa truyền thống size M, rồi đổi sang size L và thêm tiếp | Giỏ có 2 dòng riêng | BR05 | ⬜ | | |
| TC12 | Sửa giỏ, giỏ trống | Bấm +/− và "Xóa" tới khi hết | Tạm tính cập nhật ngay; hết món thì hiện "Giỏ hàng đang trống" + nút "Xem menu", không còn nút "Tiến hành đặt hàng" | UC04 | ⬜ | | |

## 3. Mã giảm giá

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC13 | Áp MAY10 | Giỏ trống → `/menu/cf-den-da`, số lượng 4 → "Thêm vào giỏ" → `/cart` (tạm tính 4 × 25.000đ = 100.000đ) → nhập `MAY10` → "Áp dụng" | Mô tả "Giảm 10% (tối đa 20.000đ)"; Giảm giá (MAY10) −10.000đ, phí giao hàng 15.000đ, **tổng 105.000đ** | BR07, BR08, BR09, tiêu chí 3 | ⬜ | | |
| TC14 | Trần giảm của MAY10 | Giỏ 12 ly Cà phê đen đá (tạm tính 300.000đ) → áp `MAY10` | Chỉ giảm 20.000đ (không phải 30.000đ), tổng 295.000đ | BR08 | ⬜ | | |
| TC15 | Mã hết hạn | Giỏ TC13 → nhập `HETHAN` | Báo "Mã HETHAN đã hết hạn" dưới ô mã, không có dòng giảm giá | BR07, tiêu chí 3 | ⬜ | | |
| TC16 | Chưa đủ đơn tối thiểu | Giỏ 2 ly Cà phê đen đá (50.000đ) → nhập `GIAM20K` | Báo "Mã GIAM20K áp dụng cho đơn từ 80.000đ, bạn cần mua thêm 30.000đ" | BR07 | ⬜ | | |
| TC17 | Mã không tồn tại, hết lượt | Nhập `KHONGCO`, rồi `HETLUOT` | "Mã giảm giá "KHONGCO" không tồn tại"; "Mã HETLUOT đã hết lượt sử dụng" | BR07 | ⬜ | | |
| TC18 | Miễn phí ship | Giỏ TC13 (100.000đ, đủ tối thiểu 99.000đ) → nhập `FREESHIP` | Mô tả "Miễn phí giao hàng", giảm đúng 15.000đ (bằng phí ship), tổng 100.000đ | BR06, BR08 | ⬜ | | |
| TC19 | Mỗi đơn một mã | Giỏ TC13: áp `MAY10`, bấm "Bỏ mã", áp `GIAM20K` | Chỉ còn GIAM20K: giảm 20.000đ, tổng 95.000đ | BR07 | ⬜ | | |

## 4. Đặt hàng

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC20 | Đặt COD | Giỏ TC13 đã áp MAY10 → "Tiến hành đặt hàng" → nhập Nguyễn An / 0912345678 / 12 Nguyễn Huệ, Quận 1 → "Thanh toán khi nhận hàng" → bấm "Đặt hàng · 105.000đ" | Toast "Đặt hàng thành công! Mã đơn của bạn: DHxxx"; sang `/orders/DHxxx`: trạng thái **Chờ xác nhận**, thanh toán "Chưa thu tiền (trả khi nhận hàng)", tổng 105.000đ (100.000 + 15.000 − 10.000); giỏ trống | BR06, BR09, BR16, tiêu chí 4 | ⬜ | | |
| TC21 | Admin thấy đơn mới ngay | Mở sẵn `/admin/orders` (đăng nhập nhân viên) ở tab khác → làm TC20 | Không tải lại trang: toast "Có đơn mới DHxxx", đơn ở đầu bảng có nhãn "Mới" | UC10, tiêu chí 4 | ⬜ | | |
| TC22 | SĐT sai | Có món trong giỏ → `/checkout` nhập đủ thông tin nhưng SĐT `0123456789` → "Đặt hàng" | Ngay dưới ô Số điện thoại: "Số điện thoại không hợp lệ: nhập 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09 (ví dụ 0912345678)", con trỏ nhảy vào ô đó; vẫn ở `/checkout`, giỏ giữ nguyên | BR11, tiêu chí 7 | ⬜ | | |
| TC23 | Họ tên, địa chỉ ngắn | Nhập họ tên `A`, địa chỉ `Q1` → "Đặt hàng" | Dưới ô Họ tên: "Họ tên phải có ít nhất 2 ký tự"; dưới ô Địa chỉ: "Địa chỉ quá ngắn: ghi rõ số nhà, tên đường, phường/quận (ít nhất 10 ký tự)" | BR11 | ⬜ | | |
| TC24 | SĐT dạng +84 | Nhập `+84987654321` (các ô khác hợp lệ) rồi đặt | Đặt được; trang đơn hiện SĐT `0987654321` | BR11 | ⬜ | | |
| TC25 | Ngoài giờ mở cửa | Dừng server, chạy lại với `FAKE_HOUR=23` (PowerShell `$env:FAKE_HOUR=23; npm run dev`) → đặt một đơn hợp lệ. Xong thì chạy lại với `FAKE_HOUR=10` hoặc bỏ biến | Phía trên nút đặt hàng báo "Cửa hàng đang đóng cửa, chỉ nhận đơn từ 08:00 đến 22:00. Hẹn gặp bạn vào giờ mở cửa nhé!"; không tạo đơn (`400`, `field: "store"`) | BR14, tiêu chí 7 | ⬜ | | |
| TC26 | Món ngừng bán trong giỏ | Thêm Cà phê muối vào giỏ → admin bấm "Ngừng bán" Cà phê muối → khách đặt hàng. Xong thì admin "Mở bán lại" | Báo "Món thứ 1 không có hoặc đã ngừng bán, vui lòng xóa khỏi giỏ (xem lại ở Giỏ hàng)."; không tạo đơn | BR13, BR23 | ⬜ | | |
| TC27 | Giá do server tính | Giỏ 1 ly Cà phê đen đá → DevTools → Application → Local Storage → `http://localhost:5173` → khóa `may-cart`: sửa `unitPrice` thành 1 → F5 → `/checkout` → đặt COD | Trang Đặt hàng hiện tạm tính 1đ (chỉ là số đọc từ giỏ trên trình duyệt), nhưng đơn tạo ra có giá thật: đơn giá 25.000đ, tạm tính 25.000đ, tổng 40.000đ | BR02 | ⬜ | | |
| TC28 | Giỏ trống | Xóa hết giỏ → mở `/checkout` | Hiện "Giỏ hàng đang trống" + nút "Xem menu", không có form | BR10 | ⬜ | | |
| TC29 | Phương thức thanh toán lạ | Chạy lệnh **P1** (Phụ lục) trong DevTools → Console ở trang http://localhost:5173 (hoặc trong `docs/api.http`, request "S2 — đặt đơn COD" sửa `"paymentMethod"` thành `"BITCOIN"` rồi Send Request) | `400` "Vui lòng chọn phương thức thanh toán: COD, MoMo hoặc VNPay", `field: "paymentMethod"` | BR12 | ⬜ | | |

## 5. Thanh toán

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC30 | MoMo thành công | Đặt đơn chọn "Ví MoMo" → cổng giả hiện "Đơn hàng #DHxxx" và "Số tiền" → "Thanh toán thành công" | Về `/orders/DHxxx`: thanh toán **Đã thanh toán**, trạng thái đơn vẫn Chờ xác nhận | BR16, BR17, tiêu chí 6 | ⬜ | | |
| TC31 | VNPay hủy | Đặt đơn chọn "VNPay" → "Hủy giao dịch" | Đơn **Đã hủy**, thanh toán "Thanh toán thất bại" | BR17, tiêu chí 6 | ⬜ | | |
| TC32 | Chữ ký sai | Ở cổng giả sửa tham số `amount` (MoMo, ví dụ thành `1000`) hoặc `vnp_Amount` (VNPay) trên thanh địa chỉ → Enter → "Thanh toán thành công" | Cổng giả báo "Chữ ký thanh toán không hợp lệ" và ở lại trang; đơn vẫn Chờ xác nhận / Chờ thanh toán | BR17 | ⬜ | | |
| TC33 | Cổng từ chối khi đặt | Chạy lệnh **P2** (Phụ lục) trong DevTools → Console: đặt MoMo 45 dòng × 20 ly Cookie đá xay + Kem cheese = 45 × 20 × 62.000đ = 55.800.000đ (MoMo giả chỉ nhận tối đa 50.000.000đ) | `402` "MoMo từ chối giao dịch: Số tiền giao dịch không hợp lệ (1.000đ – 50.000.000đ)"; **không** tạo đơn (bảng `/admin/orders` không có đơn mới) | BR18 | ⬜ | | |
| TC34 | Số tiền ở cổng VNPay | Giỏ 1 ly Trà sữa Ô Long size M (39.000đ) → đặt VNPay (tổng 39.000 + 15.000 = 54.000đ) → xem cổng giả | Cổng hiện Số tiền 54.000đ; URL có `vnp_Amount=5400000` (VNPay nhân 100, trang đã chia lại) | BR01 | ⬜ | | |

## 6. Theo dõi và tra cứu đơn

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC35 | Tự cập nhật trạng thái | Khách mở `/orders/DHxxx` của đơn Chờ xác nhận (thấy nhãn "Tự cập nhật") → nhân viên bấm "Xác nhận" ở `/admin/orders` | Trang khách tự chuyển **Đang pha chế**, toast "Đơn của bạn đang được pha chế", không phải F5 | UC08, tiêu chí 5 | ⬜ | | |
| TC36 | Đơn không tồn tại | Mở `/orders/DH999` | "Không tìm thấy đơn" + nút "Tra cứu đơn hàng" | UC08 | ⬜ | | |
| TC37 | Tra cứu đơn | `/orders/lookup`: DH001 + 0912345678 → "Tra cứu"; rồi DH001 + 0987654321 | Lần 1 hiện đơn + nút "Xem tiến trình"; lần 2 "Không tìm thấy đơn hàng. Bạn kiểm tra lại mã đơn và số điện thoại đã dùng khi đặt nhé." | C5 | ⬜ | | |

## 7. Quản trị

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC38 | Chặn khi chưa đăng nhập | Mở `/admin/orders` khi chưa đăng nhập; mở thẳng http://localhost:3001/api/admin/drinks trên trình duyệt (không có token) | Về `/admin/login`; API trả `401` `{"error":"Vui lòng đăng nhập"}` | BR20 | ⬜ | | |
| TC39 | Đăng nhập sai | Sai mật khẩu với `admin@may.vn`; sai email `x@may.vn` | Cả hai đều "Email hoặc mật khẩu không đúng" (2 lần sai này cũng được tính vào giới hạn ở TC40) | BR21 | ⬜ | | |
| TC40 | Chặn dò mật khẩu | Chạy cuối cùng (hoặc chờ 1 phút sau TC39): đăng nhập sai 6 lần liên tiếp trong 1 phút | Lần 1–5: "Email hoặc mật khẩu không đúng"; lần 6: "Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau 1 phút" (`429`). Trong phút đó đăng nhập đúng cũng bị `429`; chỉ lần sai bị đếm | BR21, B4 | ⬜ | | |
| TC41 | Đăng xuất, hết phiên | Bấm "Đăng xuất". Đăng nhập lại → dừng và chạy lại server → bấm "Menu & topping" | Lần 1 về `/admin/login`, không có thông báo; lần 2 về `/admin/login` với "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", đăng nhập lại thì quay về đúng trang Menu & topping | BR21 | ⬜ | | |
| TC42 | Vòng đời đơn | Nhân viên: đơn Chờ xác nhận → "Xác nhận" → "Giao hàng" → "Hoàn thành"; bấm "Chi tiết" | Nút đổi theo trạng thái (Chờ xác nhận: Xác nhận + Hủy; Đang pha chế: Giao hàng + Hủy; Đang giao: chỉ Hoàn thành); mục "Lịch sử trạng thái" ghi từng lần: thời điểm, "Chờ xác nhận → Đang pha chế", "Đang pha chế → Đang giao", "Đang giao → Hoàn thành" | BR15 | ⬜ | | |
| TC43 | Không hủy đơn đang giao | Tab "Đang giao": dòng DH002 không có nút Hủy; gửi request "S1 — hủy đơn đang giao → 409" trong `docs/api.http` (`PATCH /orders/DH002/status {"action":"cancel"}`) | DH002 chỉ có "Hoàn thành" và "Chi tiết"; API `409` "Không thể hủy đơn khi đơn đang ở trạng thái "Đang giao"" | BR15, tiêu chí 5 | ⬜ | | |
| TC44 | Đơn đã kết thúc | Xem đơn Hoàn thành (TC42) và Đã hủy (DH003) | Chỉ còn nút "Chi tiết", không có nút thao tác | BR15 | ⬜ | | |
| TC45 | Nhân viên sửa menu | Đăng nhập `staff` → `/admin/menu` → "Sửa" Trà sữa truyền thống → đổi giá → "Lưu món" | Trang có dòng "Bạn đăng nhập với vai trò nhân viên..."; bấm lưu báo "Bạn không có quyền thực hiện thao tác này" trên form; giá vẫn 35.000đ | BR20, tiêu chí 8 | ⬜ | | |
| TC46 | Admin sửa menu, nhật ký | Đăng nhập `admin` → sửa giá Trà sữa truyền thống thành 36000 → "Lưu món" → tab "Nhật ký". Xong thì trả giá về 35000 | Toast "Đã lưu món "Trà sữa truyền thống""; nhật ký có dòng: thời điểm, `admin@may.vn`, "Sửa món", `ts-truyen-thong` | BR22, tiêu chí 8 | ⬜ | | |
| TC47 | Kiểm tra dữ liệu món | Admin "+ Thêm món": để trống tên, giá 30000 → "Lưu món"; rồi tên "Món thử", giá -1; rồi giá 30000.5 | Lần 1 dưới ô Tên món: "Vui lòng nhập tên món"; lần 2 và 3 dưới ô Giá size M: "Giá phải là số nguyên VND không âm"; không tạo món (menu vẫn 19 món) | BR19 | ⬜ | | |
| TC48 | Ngừng bán thay cho xóa | Admin "Ngừng bán" Cà phê muối → xem `/menu`; mở `/orders/DH002`. Xong thì "Mở bán lại" | Món ẩn khỏi menu khách; bảng admin vẫn có món, nhãn "Ngừng bán" + nút "Mở bán lại"; đơn DH002 vẫn hiện "Cà phê muối" giá 35.000đ | BR23 | ⬜ | | |
| TC49 | Quyền xem nhật ký | Đăng nhập `staff` → `/admin/menu`; admin chỉ bấm qua tab Món / Topping | Nhân viên chỉ thấy tab "Món", "Topping" (không có "Nhật ký"); thao tác chỉ xem không sinh dòng nhật ký mới | BR22, UC12 | ⬜ | | |
| TC50 | Mật khẩu băm | Mở `server/src/data/users.json`; chạy `npm run check-data -w server` | Chỉ có `passwordHash` dạng `scrypt$...`, không có mật khẩu rõ; script in "Dữ liệu hợp lệ: 4 danh mục, 19 món, 6 topping, 2 tài khoản." | BR21 | ⬜ | | |

## 8. Giao diện điện thoại và chất lượng chung

| Mã | Chức năng | Các bước | Kết quả mong đợi | Ánh xạ | Kết quả | Người chạy | Ngày |
|---|---|---|---|---|---|---|---|
| TC51 | Màn hình 360px | DevTools → 360 × 800 → đi qua `/`, `/menu`, chi tiết món, `/cart`, `/checkout`, `/orders/:id`, `/orders/lookup`, `/admin/orders`, `/admin/menu` | Không có thanh cuộn ngang; nút hamburger mở/đóng menu (dùng được bằng Enter), Esc đóng, chuyển trang tự đóng | DAC_TA mục 5, B2 | ⬜ | | |
| TC52 | Vùng chạm | Ở 360px bấm thử các nút, tab, ô chọn size | Mọi nút cao ≥ 44px, bấm không trượt | DAC_TA mục 9 | ⬜ | | |
| TC53 | Backend tắt | Đang `npm run dev`: dừng riêng server (hoặc chạy `npm run dev:client` không chạy server) → mở `/menu` → bật lại server (`npm run dev:server`) → "Thử lại" | Ô lỗi "Không tải được thực đơn" kèm chi tiết "Lỗi 500" (proxy của Vite trả 500 khi không gọi được backend) và nút "Thử lại"; bật lại server rồi bấm thì menu hiện đủ món, ô lỗi biến mất | UC01 ngoại lệ, C2 | ⬜ | | |
| TC54 | Định dạng tiền | Xem giá ở menu, giỏ, đơn; gọi `GET /api/drinks/ts-truyen-thong` | Giao diện "35.000đ"; API trả số nguyên `"basePrice": 35000` | BR01 | ⬜ | | |
| TC55 | Test tự động | `npm test`, `npm run test:acceptance`, `npm run build` | Không có FAIL, không còn `todo`; `docs/patterns/` đủ 11 pattern | tiêu chí 9 | ⬜ | | |

## 9. Bảng phủ quy tắc nghiệp vụ (BR → test case)

Test tự động nằm ở `server/tests/` trừ khi ghi rõ `client/tests/`.

| Quy tắc | Nội dung tóm tắt | Test case thủ công | Test tự động liên quan |
|---|---|---|---|
| BR01 | Tiền là số nguyên VND, hiển thị "35.000đ" | TC05, TC34, TC54 | `api.test.js` (C4), `cart.test.js` |
| BR02 | Đơn giá = gốc + size + topping; giá do server tính | TC05, TC27 | `builder.test.js`, `cart.test.js`, `place-order.test.js` |
| BR03 | Size M/L, đường/đá 0–100%, mặc định; quy tắc theo loại đồ uống | TC04, TC07 | `builder.test.js`, `cart.test.js` |
| BR04 | Topping chọn nhiều lần cộng nhiều lần | TC06 | `decorator.test.js`, `cart.test.js` |
| BR05 | Gộp dòng giống nhau, giỏ còn khi tải lại | TC09, TC10, TC11 | `client/tests/cartStore.test.js`, `client/tests/cartStorage.test.js` |
| BR06 | Phí ship 15.000đ | TC18, TC20 | `place-order.test.js`, `voucher.test.js` |
| BR07 | Điều kiện dùng mã, mỗi đơn một mã | TC13, TC15, TC16, TC17, TC19 | `voucher.test.js` |
| BR08 | Cách tính percent / fixed / freeship | TC13, TC14, TC18 | `strategy.test.js` |
| BR09 | Tổng = tạm tính + ship − giảm | TC13, TC20 | `facade.test.js`, `place-order.test.js` |
| BR10 | Đơn có ít nhất 1 món | TC28 | `chain.test.js` |
| BR11 | Họ tên, SĐT, địa chỉ hợp lệ | TC22, TC23, TC24 | `chain.test.js`, `validators.test.js` |
| BR12 | Phương thức ∈ COD/MOMO/VNPAY | TC29 | `chain.test.js` |
| BR13 | Món/topping đang bán, số lượng 1–20 | TC08, TC26 | `chain.test.js` |
| BR14 | Nhận đơn 08:00 – trước 22:00 | TC25 | `chain.test.js`, `place-order.test.js` |
| BR15 | Vòng đời đơn, hủy khi PENDING/PREPARING, ghi lịch sử | TC42, TC43, TC44 | `state.test.js`, `admin-orders.test.js` |
| BR16 | COD → UNPAID, online → PENDING | TC20, TC30 | `adapter.test.js`, `place-order.test.js` |
| BR17 | Cổng báo thành công/thất bại, chữ ký sai 400 | TC30, TC31, TC32 | `payment.test.js` |
| BR18 | Cổng từ chối → 402, không tạo đơn | TC33 | `facade.test.js`, `place-order.test.js` |
| BR19 | Dữ liệu món/topping hợp lệ | TC47 | `admin-menu.test.js` |
| BR20 | Phân quyền khách / staff / admin | TC38, TC45 | `proxy.test.js`, `auth.test.js`, `admin-menu.test.js` |
| BR21 | Phiên 8 giờ, sai không nói rõ, mật khẩu băm | TC39, TC40, TC41, TC50 | `auth.test.js`, `security.test.js`, `integrations.test.js` |
| BR22 | Mọi thao tác sửa menu ghi nhật ký | TC46, TC49 | `proxy.test.js`, `admin-menu.test.js` |
| BR23 | Ngừng bán thay xóa, đơn cũ giữ tên/giá | TC02, TC26, TC48 | `admin-menu.test.js` |

Không còn quy tắc nào từ BR01 đến BR23 chưa có test case.

## 10. Bảng tiêu chí nghiệm thu (DAC_TA mục 10 → test case)

| Tiêu chí | Test case | Test tự động (`server/tests/acceptance.test.js`) |
|---|---|---|
| 1. Size L, đường 50%, 2 topping → giá đúng BR02 | TC05 | Tiêu chí 1 |
| 2. Thêm 2 lần cùng tổ hợp → gộp, tải lại vẫn còn | TC09, TC10 | Tiêu chí 2 (gộp ở `cartStore.test.js` phía client) |
| 3. MAY10 cho đơn 100.000đ → giảm 10.000đ; mã hết hạn báo lỗi | TC13, TC15 | Tiêu chí 3 |
| 4. Đặt COD → PENDING/UNPAID; admin thấy đơn mới không tải lại | TC20, TC21 | Tiêu chí 4 |
| 5. Nhân viên xác nhận → khách tự đổi; hủy đơn đang giao bị từ chối | TC35, TC43 | Tiêu chí 5 |
| 6. MoMo thành công → PAID; VNPay hủy → CANCELLED | TC30, TC31 | Tiêu chí 6 |
| 7. SĐT sai → lỗi đúng ô; 23:00 → đóng cửa | TC22, TC25 | Tiêu chí 7 |
| 8. Nhân viên sửa giá → 403; admin sửa được, nhật ký ghi lại | TC45, TC46 | Tiêu chí 8 |
| 9. `npm test` PASS, không `todo`; đủ `docs/patterns` | TC55 | Tiêu chí 9 |

## Phụ lục — lệnh dán vào DevTools → Console (trang http://localhost:5173)

**P1 — TC29, phương thức thanh toán lạ:**

```js
fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1' }, paymentMethod: 'BITCOIN', items: [{ drinkId: 'cf-den-da', quantity: 1 }] }) }).then((r) => r.json().then((b) => console.log(r.status, b)));
```

**P2 — TC33, đơn MoMo vượt hạn mức 50.000.000đ:**

```js
fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1' }, paymentMethod: 'MOMO', items: Array(45).fill({ drinkId: 'dx-cookie', toppingIds: ['kem-cheese'], quantity: 20 }) }) }).then((r) => r.json().then((b) => console.log(r.status, b)));
```
