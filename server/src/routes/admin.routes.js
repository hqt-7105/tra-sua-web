import { Router } from 'express';
import { notImplemented } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authService } from '../services/authService.js';
import { menuService } from '../services/menuService.js';
import { MenuServiceProxy } from '../patterns/structural/MenuServiceProxy.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { adminFeed } from '../events.js';
import { openEventStream } from '../utils/sse.js';

const router = Router();
const staff = requireAuth('admin', 'staff');
const adminOnly = requireAuth('admin');

// ---------------------------------------------------------------- TV4 (Sprint 2)
// Đăng nhập: body { email, password } → { token, user }. Sai → 401, không nói rõ sai phần nào (BR21).
router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  res.json(authService.login(email, password));
});
router.post('/logout', staff, (req, res) => {
  authService.logout(req.token);
  res.status(204).end();
});
router.get('/me', staff, (req, res) => {
  res.json(req.user);
});

// Quản lý menu — route gọi qua MenuServiceProxy (Proxy), KHÔNG gọi thẳng MenuService.
// Ở đây dùng `staff` để Proxy tự quyết định quyền đọc/ghi (đúng vai trò Proxy):
// staff đọc được, ghi bị 403; admin ghi được và Proxy ghi nhật ký (BR20, BR22).
const menuOf = (req) => new MenuServiceProxy(menuService, req.user, auditLogRepository);
const proxied = (handler) => asyncHandler(async (req, res) => res.json(await handler(menuOf(req), req)));
const listOptions = (req) => ({ includeInactive: req.query.includeInactive === 'true' });

router.get('/drinks', staff, proxied((menu, req) => menu.listDrinks(listOptions(req))));
router.post('/drinks', staff, proxied((menu, req) => menu.createDrink(req.body)));
router.put('/drinks/:id', staff, proxied((menu, req) => menu.updateDrink(req.params.id, req.body)));
// Ngừng bán (isActive=false), không xóa hẳn (BR23)
router.delete('/drinks/:id', staff, proxied((menu, req) => menu.deactivateDrink(req.params.id)));
router.get('/toppings', staff, proxied((menu, req) => menu.listToppings(listOptions(req))));
router.post('/toppings', staff, proxied((menu, req) => menu.createTopping(req.body)));
router.put('/toppings/:id', staff, proxied((menu, req) => menu.updateTopping(req.params.id, req.body)));
router.delete('/toppings/:id', staff, proxied((menu, req) => menu.deactivateTopping(req.params.id)));

// Nhật ký sửa menu: chỉ admin (UC12), mới nhất trước
router.get('/audit-log', adminOnly, (req, res) => {
  res.json(auditLogRepository.findAll());
});

// ---------------------------------------------------------------- TV5 (Sprint 2)
// Danh sách đơn: ?status=PENDING → mới nhất trước
router.get('/orders', staff, notImplemented('TV5'));
// Đổi trạng thái: body { action: 'next' | 'cancel' } → 409 nếu không hợp lệ,
// thành công thì orderEvents.notify({ type: 'STATUS_CHANGED', ... })
router.patch('/orders/:id/status', staff, notImplemented('TV5'));

// ---------------------------------------------------------------- TV2 (Sprint 2)
// SSE: luồng sự kiện mọi đơn cho màn hình admin (AdminFeedObserver).
// EventSource không gửi được header nên token đi qua ?token=... (requireAuth đọc cả hai).
router.get('/events', staff, (req, res) => {
  openEventStream(req, res, (stream) => adminFeed.addClient(stream));
});

export default router;
