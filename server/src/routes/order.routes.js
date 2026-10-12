import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { validatePhone } from '../utils/validators.js';
import { customerStream } from '../events.js';
import { openEventStream } from '../utils/sse.js';
import { changeOrderStatus, findOrderOr404 } from '../services/orderStatusService.js';
import { orderFacade } from '../services/orderFacadeInstance.js';

const router = Router();

/**
 * POST /api/orders — TV1 (Sprint 2 - Facade)
 *   body: xem request trong src/patterns/structural/OrderFacade.js
 *   → 201 { order, payment }
 *   Route CHỈ gọi facade.placeOrder(req.body), không tự xử lý nghiệp vụ.
 *   Lỗi: 400 (ValidationError, kèm field), 404 (voucher/món), 402 (thanh toán thất bại)
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    res.status(201).json(await orderFacade.placeOrder(req.body ?? {}));
  }),
);

/**
 * GET /api/orders/lookup?id=DH004&phone=0912345678 — TV5 (C5)
 *   Khách xem lại đơn không cần tài khoản: trả đơn (cùng dạng GET /:id) khi mã đơn VÀ
 *   số điện thoại khớp. SĐT so sau khi chuẩn hóa (+84 → 0, bỏ khoảng trắng).
 *   Sai SĐT hoặc không có đơn → cùng 404 'Không tìm thấy đơn hàng' (không để lộ đơn có tồn tại).
 *   Thiếu tham số → 400 kèm field 'id' | 'phone'.
 *   Đặt TRƯỚC GET /:id để '/lookup' không bị hiểu là mã đơn.
 */
const normalizePhone = (value) => {
  const result = validatePhone(value);
  return result.ok ? result.value : String(value).trim();
};

router.get('/lookup', (req, res) => {
  const id = typeof req.query.id === 'string' ? req.query.id.trim().toUpperCase() : '';
  const phone = typeof req.query.phone === 'string' ? req.query.phone.trim() : '';
  if (!id) throw Object.assign(new HttpError(400, 'Vui lòng nhập mã đơn hàng'), { field: 'id' });
  if (!phone) throw Object.assign(new HttpError(400, 'Vui lòng nhập số điện thoại đặt hàng'), { field: 'phone' });

  const order = orderRepository.findById(id);
  if (!order || normalizePhone(order.phone) !== normalizePhone(phone)) {
    throw new HttpError(404, 'Không tìm thấy đơn hàng');
  }
  res.json(order);
});

/**
 * GET /api/orders/:id/events — TV2 (Observer, SSE)
 *   Trang theo dõi đơn của khách mở luồng này; CustomerStreamObserver chỉ đẩy
 *   sự kiện của đúng đơn :id. Đơn không có → 404 (JSON, không mở luồng).
 */
router.get('/:id/events', (req, res) => {
  const { id } = findOrderOr404(req.params.id);
  openEventStream(req, res, (stream) => customerStream.addClient(id, stream));
});

/**
 * TV5 (Sprint 1 - State). Lưu đơn qua orderRepository.
 *
 * GET   /api/orders/:id          → { id, status, allowedActions: ['next','cancel'], ... }
 * PATCH /api/orders/:id/status   body { action: 'next' | 'cancel' }
 *                                → đơn sau khi chuyển trạng thái
 *                                → 409 nếu chuyển trạng thái không hợp lệ
 *                                → phát STATUS_CHANGED (Observer, Sprint 2)
 */
router.get('/:id', (req, res) => {
  res.json(findOrderOr404(req.params.id));
});

router.patch('/:id/status', (req, res) => {
  res.json(changeOrderStatus(req.params.id, req.body?.action));
});

export default router;
