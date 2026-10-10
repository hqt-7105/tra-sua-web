import { Router } from 'express';
import { notImplemented } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * POST /api/vouchers/validate  — TV4 (Strategy)
 *
 * Body:     { code, subtotal, shippingFee }
 * Response: { code, type, discount, total, message }
 *   total = subtotal + shippingFee - discount
 *
 * Lỗi: mã không tồn tại → 404; hết hạn / chưa đủ giá trị tối thiểu → 400.
 * Dữ liệu voucher: tạo file src/data/vouchers.json (xem docs/API.md).
 */
router.post('/validate', notImplemented('TV4'));

export default router;
