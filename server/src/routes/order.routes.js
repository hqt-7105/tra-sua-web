import { Router } from 'express';
import { notImplemented } from '../middlewares/errorHandler.js';
import { customerStream } from '../events.js';
import { openEventStream } from '../utils/sse.js';
import { changeOrderStatus, findOrderOr404 } from '../services/orderStatusService.js';

const router = Router();

/**
 * POST /api/orders — TV1 (Sprint 2 - Facade)
 *   body: xem request trong src/patterns/structural/OrderFacade.js
 *   → 201 { order, payment }
 *   Route CHỈ gọi facade.placeOrder(req.body), không tự xử lý nghiệp vụ.
 *   Lỗi: 400 (ValidationError, kèm field), 404 (voucher/món), 402 (thanh toán thất bại)
 */
router.post('/', notImplemented('TV1'));

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
