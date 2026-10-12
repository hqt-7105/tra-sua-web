/**
 * ============================================================================
 * PATTERN: Proxy (Structural) — PHỤ TRÁCH: TV4
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
 * Ví dụ sử dụng:
 *   const service = new MenuServiceProxy(menuService, req.user, auditLogRepository);
 *   await service.listDrinks({ includeInactive: true });   // staff, admin: được
 *   await service.updateDrink('ts-truyen-thong', { basePrice: 36000 });
 *   // staff → HttpError 403, menuService không bị gọi
 *   // admin → sửa xong, auditLog có { at, email: 'admin@may.vn', action: 'updateDrink', targetId }
 *
 * Test chấp nhận: tests/proxy.test.js (dùng realService giả), tests/admin-menu.test.js (API)
 * ============================================================================
 */
import { HttpError } from '../../middlewares/errorHandler.js';

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

/** Vai trò được phép theo loại thao tác (BR20). */
const READ_ROLES = ['admin', 'staff'];
const WRITE_ROLES = ['admin'];

export class MenuServiceProxy {
  constructor(realService, user, auditLog = []) {
    this.realService = realService;
    this.user = user;
    this.auditLog = auditLog;
  }

  // ---- Subject: cùng 8 hàm như MenuService thật ----
  listDrinks(...args) {
    return this.#read('listDrinks', args);
  }

  listToppings(...args) {
    return this.#read('listToppings', args);
  }

  createDrink(...args) {
    return this.#write('createDrink', args);
  }

  updateDrink(...args) {
    return this.#write('updateDrink', args);
  }

  deactivateDrink(...args) {
    return this.#write('deactivateDrink', args);
  }

  createTopping(...args) {
    return this.#write('createTopping', args);
  }

  updateTopping(...args) {
    return this.#write('updateTopping', args);
  }

  deactivateTopping(...args) {
    return this.#write('deactivateTopping', args);
  }

  /** Kiểm tra quyền TRƯỚC khi chạm tới service thật: sai thì service thật không bị gọi. */
  #authorize(roles) {
    if (!this.user) throw new HttpError(401, 'Vui lòng đăng nhập');
    if (!roles.includes(this.user.role)) {
      throw new HttpError(403, 'Bạn không có quyền thực hiện thao tác này');
    }
  }

  async #read(method, args) {
    this.#authorize(READ_ROLES);
    return this.realService[method](...args);
  }

  /** Ghi nhật ký SAU khi service thật làm xong; service thật lỗi thì lỗi ném tiếp, không ghi (BR22). */
  async #write(method, args) {
    this.#authorize(WRITE_ROLES);
    const result = await this.realService[method](...args);
    this.auditLog.push({
      at: new Date().toISOString(),
      email: this.user.email,
      action: method,
      targetId: result?.id ?? args[0],
    });
    return result;
  }
}
