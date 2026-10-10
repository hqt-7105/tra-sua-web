import { Router } from 'express';
import { notImplemented } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
const staff = requireAuth('admin', 'staff');
const adminOnly = requireAuth('admin');

// ---------------------------------------------------------------- TV4 (Sprint 2)
// Đăng nhập: body { email, password } → { token, user }
router.post('/login', notImplemented('TV4'));
router.post('/logout', staff, notImplemented('TV4'));
router.get('/me', staff, notImplemented('TV4'));

// Quản lý menu — route gọi qua MenuServiceProxy (Proxy), KHÔNG gọi thẳng MenuService:
//   const service = new MenuServiceProxy(menuService, req.user, auditLog);
// Ở đây dùng `staff` để Proxy tự quyết định quyền đọc/ghi (đúng vai trò Proxy).
router.get('/drinks', staff, notImplemented('TV4')); // ?includeInactive=true
router.post('/drinks', staff, notImplemented('TV4'));
router.put('/drinks/:id', staff, notImplemented('TV4'));
router.delete('/drinks/:id', staff, notImplemented('TV4')); // ngừng bán (isActive=false), không xóa hẳn
router.get('/toppings', staff, notImplemented('TV4'));
router.post('/toppings', staff, notImplemented('TV4'));
router.put('/toppings/:id', staff, notImplemented('TV4'));
router.delete('/toppings/:id', staff, notImplemented('TV4'));
router.get('/audit-log', adminOnly, notImplemented('TV4'));

// ---------------------------------------------------------------- TV5 (Sprint 2)
// Danh sách đơn: ?status=PENDING → mới nhất trước
router.get('/orders', staff, notImplemented('TV5'));
// Đổi trạng thái: body { action: 'next' | 'cancel' } → 409 nếu không hợp lệ,
// thành công thì orderEvents.notify({ type: 'STATUS_CHANGED', ... })
router.patch('/orders/:id/status', staff, notImplemented('TV5'));

// ---------------------------------------------------------------- TV2 (Sprint 2)
// SSE: luồng sự kiện mọi đơn cho màn hình admin (AdminFeedObserver)
router.get('/events', staff, notImplemented('TV2'));

export default router;
