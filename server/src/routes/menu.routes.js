import { Router } from 'express';
import { menuRepository } from '../repositories/menuRepository.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { createDrinkFromData } from '../patterns/creational/DrinkFactory.js';

const router = Router();

/**
 * Bản ghi món + phần do chính loại đồ uống tự mô tả (Factory Method, TV1).
 * Route không biết MilkTea hay Coffee: factory chọn đúng lớp theo categoryId.
 * Giữ nguyên các trường cũ để frontend không bị vỡ.
 */
const toMenuItem = (drinkData) => {
  const drink = createDrinkFromData(drinkData);
  return {
    ...drinkData,
    categoryName: drink.getCategoryName(),
    customization: drink.getCustomization(),
  };
};

router.get('/categories', (req, res) => {
  res.json(menuRepository.getCategories());
});

/** GET /api/drinks?categoryId=tra-sua&bestSeller=true&q=matcha */
router.get('/drinks', (req, res) => {
  const { categoryId, bestSeller, q } = req.query;
  const drinks = menuRepository.getDrinks({ categoryId, bestSeller: bestSeller === 'true', q });
  res.json(drinks.map(toMenuItem));
});

router.get('/drinks/:id', (req, res) => {
  const drink = menuRepository.getDrinkById(req.params.id);
  if (!drink) throw new HttpError(404, 'Không tìm thấy món');
  res.json(toMenuItem(drink));
});

router.get('/toppings', (req, res) => {
  res.json(menuRepository.getToppings());
});

router.get('/options', (req, res) => {
  res.json(menuRepository.getOptions());
});

export default router;
