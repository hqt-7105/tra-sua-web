import { readFileSync } from 'node:fs';

/**
 * Repository đọc dữ liệu menu từ file JSON.
 * Sprint 0 dùng JSON cho nhanh; khi chuyển sang MySQL/PostgreSQL chỉ cần
 * viết lại file này, các route và pattern phía trên không phải sửa.
 *
 * Sprint 2 (TV4, quản lý menu): thêm hàm cho admin, đọc cả món/topping ngừng bán
 * và ghi trong bộ nhớ (khởi động lại server thì về dữ liệu gốc trong JSON).
 *   getAllDrinks(), getAllToppings()        → bản sao, gồm cả isActive = false
 *   findDrink(id), findTopping(id)          → bản sao bất kể trạng thái bán | null
 *   createDrink(data), createTopping(data)  → bản ghi mới (id tự sinh từ tên, không trùng)
 *   updateDrink(id, changes), updateTopping(id, changes) → bản ghi sau khi sửa | null
 *   categoryExists(categoryId)
 * Hàm cho khách (getDrinks, getDrinkById, ...) vẫn chỉ trả món đang bán (BR23).
 */
const load = (file) =>
  JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf-8'));

const categories = load('categories.json');
const drinks = load('drinks.json');
const toppings = load('toppings.json');
const options = load('options.json');

const copy = (record) => (record ? { ...record } : null);

/** 'Trà sữa khoai môn' → 'tra-sua-khoai-mon'; trùng thì thêm -2, -3... */
function uniqueSlug(name, records) {
  const base =
    String(name)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'mon-moi';
  let id = base;
  for (let n = 2; records.some((r) => r.id === id); n++) id = `${base}-${n}`;
  return id;
}

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

  // ---- Quản lý menu (admin, Sprint 2) ----
  categoryExists(categoryId) {
    return categories.some((c) => c.id === categoryId);
  },

  getAllDrinks() {
    return drinks.map(copy);
  },

  getAllToppings() {
    return toppings.map(copy);
  },

  findDrink(id) {
    return copy(drinks.find((d) => d.id === id));
  },

  findTopping(id) {
    return copy(toppings.find((t) => t.id === id));
  },

  createDrink(data) {
    const drink = { ...data, id: uniqueSlug(data.name, drinks) };
    drinks.push(drink);
    return copy(drink);
  },

  updateDrink(id, changes) {
    const drink = drinks.find((d) => d.id === id);
    if (!drink) return null;
    Object.assign(drink, changes, { id });
    return copy(drink);
  },

  createTopping(data) {
    const topping = { ...data, id: uniqueSlug(data.name, toppings) };
    toppings.push(topping);
    return copy(topping);
  },

  updateTopping(id, changes) {
    const topping = toppings.find((t) => t.id === id);
    if (!topping) return null;
    Object.assign(topping, changes, { id });
    return copy(topping);
  },
};
