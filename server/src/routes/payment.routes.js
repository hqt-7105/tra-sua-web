import { Router } from 'express';
import { notImplemented } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * TV3 (Sprint 2 - Adapter)
 *
 * GET /api/payments/methods
 *   → [{ id: 'COD', name: 'Thanh toán khi nhận hàng' },
 *      { id: 'MOMO', name: 'Ví MoMo' }, { id: 'VNPAY', name: 'VNPay' }]
 *   (lấy danh sách từ config.paymentMethods)
 *
 * POST /api/payments/confirm
 *   body { gateway: 'momo' | 'vnpay', params: { ...query trang /payment/mock gửi về } }
 *   1. adapter = createPaymentGateway(gateway.toUpperCase()); result = await adapter.verify(params)
 *   2. order = orderRepository.findById(result.orderId) → không có: 404
 *   3. success → order.paymentStatus = 'PAID'
 *      thất bại → order.paymentStatus = 'FAILED'; order.cancel()
 *   4. orderRepository.save(order); orderEvents.notify({ type: 'PAYMENT_UPDATED', ... })
 *   → { orderId, status, paymentStatus }
 */
router.get('/methods', notImplemented('TV3'));
router.post('/confirm', notImplemented('TV3'));

export default router;
