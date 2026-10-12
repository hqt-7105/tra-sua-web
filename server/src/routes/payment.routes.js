import { Router } from 'express';
import { config } from '../config.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createPaymentGateway } from '../patterns/structural/PaymentAdapter.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { orderEvents, orderEvent } from '../events.js';

const router = Router();

/** Tên hiển thị của từng phương thức (mã lấy từ config.paymentMethods). */
const METHOD_NAMES = {
  COD: 'Thanh toán khi nhận hàng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
};

/**
 * GET /api/payments/methods — TV3
 *   → [{ id: 'COD', name: 'Thanh toán khi nhận hàng' }, { id: 'MOMO', name: 'Ví MoMo' }, { id: 'VNPAY', name: 'VNPay' }]
 */
router.get('/methods', (req, res) => {
  res.json(config.paymentMethods.map((id) => ({ id, name: METHOD_NAMES[id] ?? id })));
});

/**
 * POST /api/payments/confirm — TV3 (Client của Adapter)
 *   body { gateway: 'momo' | 'vnpay', params: { ...query trang /payment/mock gửi về } }
 *   Route không biết MoMo hay VNPay trả về dạng gì: Adapter "dịch" mọi cổng về
 *   { orderId, success, transactionId }.
 *   success → paymentStatus PAID (BR17); thất bại/khách hủy → FAILED và đơn CANCELLED.
 *   Đổi xong thì phát PAYMENT_UPDATED (Observer) để trang theo dõi đơn và admin tự cập nhật.
 *   Đơn đã xử lý thanh toán rồi (không còn PENDING) → trả trạng thái hiện tại, không đổi gì.
 *   → { orderId, status, paymentStatus }
 *   Lỗi: 400 chữ ký sai / gateway lạ / cổng không khớp đơn · 404 không có đơn
 */
router.post(
  '/confirm',
  asyncHandler(async (req, res) => {
    const { gateway, params } = req.body ?? {};
    if (typeof gateway !== 'string' || !gateway.trim()) {
      throw Object.assign(new HttpError(400, 'Thiếu tên cổng thanh toán'), { field: 'gateway' });
    }
    const adapter = createPaymentGateway(gateway.trim().toUpperCase());
    const result = await adapter.verify(params ?? {});

    const order = orderRepository.findById(result.orderId);
    if (!order) throw new HttpError(404, `Không tìm thấy đơn ${result.orderId}`);
    if (order.paymentMethod !== adapter.getMethod()) {
      throw new HttpError(400, 'Cổng thanh toán không khớp với phương thức của đơn hàng');
    }

    if (order.paymentStatus === 'PENDING') {
      if (result.success) {
        order.paymentStatus = 'PAID';
      } else {
        order.cancel(); // State tự kiểm tra có được hủy không (BR15)
        order.paymentStatus = 'FAILED';
      }
      orderRepository.save(order);
      orderEvents.notify(orderEvent('PAYMENT_UPDATED', order));
    }

    res.json({ orderId: order.id, status: order.getStatus(), paymentStatus: order.paymentStatus });
  }),
);

export default router;
