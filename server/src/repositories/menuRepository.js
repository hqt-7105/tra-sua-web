import { readFileSync } from 'node:fs';

/**
 * Repository đọc dữ liệu menu từ file JSON.
 * Sprint 0 dùng JSON cho nhanh; khi chuyển sang MySQL/PostgreSQL chỉ cần
 * viết lại file này, các route và pattern phía trên không phải sửa.
 */
const load = (file) =>
  JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf-8'));

const categories = load('categories.json');
const drinks = load('drinks.json');
const toppings = load('toppings.json');
const options = load('options.json');

export const menuRepository = {
  getCategories() {
    return categories;
  },

  getDrinks({ categoryId, bestSeller, q } = {}) {
    let result = drinks.filter((d) => d.isActive);
    if (categoryId) result = result.filter((d) => d.categoryId === categoryId);
    if (bestSeller) result = result.filter((d) => d.isBestSeller);
    if (q) {
      const keyword = q.trim().toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(keyword));
    }
    return result;
  },

  getDrinkById(id) {
    return drinks.find((d) => d.id === id && d.isActive) || null;
  },

  getToppings() {
    return toppings.filter((t) => t.isActive);
  },

  getToppingById(id) {
    return toppings.find((t) => t.id === id && t.isActive) || null;
  },

  /** Size, mức đường, mức đá */
  getOptions() {
    return options;
  },
};
