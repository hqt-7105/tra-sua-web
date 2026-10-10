/**
 * ============================================================================
 * PATTERN: Proxy (Structural) — PHỤ TRÁCH: TV4            [Sprint 2 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Trang admin cho phép thêm/sửa/ngừng bán món và topping. Nhân viên (staff)
 *   chỉ được XEM, chỉ quản trị (admin) được SỬA, và mọi thao tác sửa phải ghi
 *   nhật ký. Nhét kiểm tra quyền + ghi log vào MenuService thì lớp này vừa lo
 *   nghiệp vụ vừa lo bảo mật.
 *
 * Giải pháp:
 *   MenuServiceProxy có CÙNG các hàm như MenuService, đứng chắn phía trước:
 *   kiểm tra quyền → gọi MenuService thật → ghi nhật ký.
 *   (Protection Proxy kết hợp Logging Proxy)
 *
 * Cấu trúc GoF:
 *   Subject      = các hàm trong MENU_SERVICE_METHODS
 *   RealSubject  = MenuService     (src/services/menuService.js — TV4 tạo)
 *   Proxy        = MenuServiceProxy
 *   Client       = route /api/admin/drinks, /api/admin/toppings
 *
 * Hợp đồng:
 *   const service = new MenuServiceProxy(realService, user, auditLog)
 *     user = { email, role: 'admin' | 'staff' } | null
 *   Hàm đọc (READ_METHODS)  → admin và staff đều được
 *   Hàm ghi (WRITE_METHODS) → chỉ admin
 *   user null              → throw HttpError(401), KHÔNG gọi realService
 *   Sai quyền              → throw HttpError(403), KHÔNG gọi realService
 *   Ghi thành công         → auditLog.push({ at, email, action, targetId })
 *                            targetId = id của kết quả trả về hoặc tham số id
 *   realService throw      → ném lỗi tiếp, KHÔNG ghi audit
 *   Proxy trả về đúng kết quả của realService.
 *
 * Test chấp nhận: tests/proxy.test.js (dùng realService giả). Bỏ `todo` khi làm xong.
 * ============================================================================
 */
// import { HttpError } from '../../middlewares/errorHandler.js';

export const READ_METHODS = ['listDrinks', 'listToppings'];
export const WRITE_METHODS = [
  'createDrink',
  'updateDrink',
  'deactivateDrink',
  'createTopping',
  'updateTopping',
  'deactivateTopping',
];
export const MENU_SERVICE_METHODS = [...READ_METHODS, ...WRITE_METHODS];

export class MenuServiceProxy {
  constructor(realService, user, auditLog = []) {
    this.realService = realService;
    this.user = user;
    this.auditLog = auditLog;
  }

  // TODO(TV4): cài đủ 8 hàm trong MENU_SERVICE_METHODS.
  // Gợi ý: viết 2 hàm private #read(method, args) và #write(method, args) để không lặp code.
}
