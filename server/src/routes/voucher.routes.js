import { Router } from 'express';
import { voucherService } from '../services/voucherService.js';

const router = Router();

/**
 * GET /api/vouchers — TV4
 * Danh sách mã còn dùng được (mục Khuyến mãi ở trang chủ).
 * Response: [{ code, type, message, minOrder, expiresAt }]
 */
router.get('/', (req, res) => {
  res.json(voucherService.listActive());
});

/**
 * POST /api/vouchers/validate  — TV4 (Strategy)
 *
 * Body:     { code, subtotal, shippingFee }
 * Response: { code, type, discount, total, message }
 *   total = subtotal + shippingFee - discount
 *
 * Lỗi: mã không tồn tại → 404; hết hạn / hết lượt / chưa đủ giá trị tối thiểu → 400.
 */
router.post('/validate', (req, res) => {
  const { code, subtotal, shippingFee } = req.body ?? {};
  res.json(voucherService.apply({ code, subtotal, shippingFee }));
});

export default router;
