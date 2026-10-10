import { Router } from 'express';
import { menuRepository } from '../repositories/menuRepository.js';
import { HttpError } from '../middlewares/errorHandler.js';

const router = Router();

router.get('/categories', (req, res) => {
  res.json(menuRepository.getCategories());
});

/**
 * GET /api/drinks?categoryId=tra-sua&bestSeller=true&q=matcha
 *
 * TODO(TV1 - Factory Method): sau khi cài DrinkFactory, map từng bản ghi qua
 * factory rồi trả về drink.toJSON() để mỗi loại đồ uống tự mô tả mình
 * (xem docs/PHAN_CONG_SPRINT_1.md, Task 1).
 */
router.get('/drinks', (req, res) => {
  const { categoryId, bestSeller, q } = req.query;
  res.json(menuRepository.getDrinks({ categoryId, bestSeller: bestSeller === 'true', q }));
});

router.get('/drinks/:id', (req, res) => {
  const drink = menuRepository.getDrinkById(req.params.id);
  if (!drink) throw new HttpError(404, 'Không tìm thấy món');
  res.json(drink);
});

router.get('/toppings', (req, res) => {
  res.json(menuRepository.getToppings());
});

router.get('/options', (req, res) => {
  res.json(menuRepository.getOptions());
});

export default router;
