import { Router } from 'express';
import { HttpError, notImplemented } from '../middlewares/errorHandler.js';
import { orderRepository } from '../repositories/orderRepository.js';

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
 * GET /api/orders/:id/events — TV2 (Sprint 2 - Observer)
 *   Server-Sent Events cho trang theo dõi đơn của khách:
 *     res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
 *     const remove = customerStream.addClient(req.params.id, res);
 *     req.on('close', remove);
 */
router.get('/:id/events', notImplemented('TV2'));

/**
 * TV5 (Sprint 1 - State). Lưu đơn qua orderRepository.
 *
 * GET   /api/orders/:id          → { id, status, allowedActions: ['next','cancel'], ... }
 * PATCH /api/orders/:id/status   body { action: 'next' | 'cancel' }
 *                                → đơn sau khi chuyển trạng thái
 *                                → 409 nếu chuyển trạng thái không hợp lệ
 * Sprint 2: sau khi chuyển thành công gọi orderEvents.notify({ type: 'STATUS_CHANGED', ... })
 */
const ACTIONS = ['next', 'cancel'];

function findOrderOr404(id) {
  const order = orderRepository.findById(id);
  if (!order) throw new HttpError(404, `Không tìm thấy đơn ${id}`);
  return order;
}

router.get('/:id', (req, res) => {
  res.json(findOrderOr404(req.params.id));
});

router.patch('/:id/status', (req, res) => {
  const { action } = req.body ?? {};
  if (!ACTIONS.includes(action)) {
    throw Object.assign(new HttpError(400, 'Thao tác không hợp lệ, chỉ nhận "next" hoặc "cancel"'), {
      field: 'action',
    });
  }
  const order = findOrderOr404(req.params.id);
  // State của đơn tự quyết định có cho phép không (sai → InvalidTransitionError 409).
  order[action]();
  orderRepository.save(order);
  res.json(order);
});

export default router;
