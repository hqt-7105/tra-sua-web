import { Router } from 'express';
import { notImplemented } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * POST /api/cart/price  — TV3 (Builder + dùng Decorator có sẵn)
 *
 * Body:     { drinkId, size, sugar, ice, toppingIds: [], quantity, note }
 * Response: { description, size, sugar, ice, toppings: [...], quantity,
 *             unitPrice, totalPrice }
 *
 * Gợi ý: lấy drink + toppings từ menuRepository, dùng OrderItemBuilder dựng
 * món rồi trả builder.build().toJSON(). Lỗi đầu vào → HttpError(400, ...).
 */
router.post('/price', notImplemented('TV3'));

export default router;
