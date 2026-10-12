import { Router } from 'express';
import { createOrderItem } from '../services/orderItemService.js';

const router = Router();

/**
 * POST /api/cart/price  — TV3 (Builder + Factory Method + Decorator có sẵn)
 *
 * Body:     { drinkId, size, sugar, ice, toppingIds: [], quantity, note }
 * Response: { drinkId, description, size, sugar, ice, toppings: [...], quantity,
 *             note, unitPrice, totalPrice }
 * Lỗi: 404 món/topping không có · 400 + field khi tùy chọn sai.
 */
router.post('/price', (req, res) => {
  res.json(createOrderItem(req.body).toJSON());
});

export default router;
