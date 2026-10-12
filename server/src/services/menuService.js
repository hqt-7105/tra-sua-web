/**
 * Quản lý món và topping — PHỤ TRÁCH: TV4 (Sprint 2). RealSubject của Proxy.
 *
 * Chỉ lo nghiệp vụ: kiểm tra dữ liệu (BR19), ngừng bán thay cho xóa (BR23), đọc/ghi
 * qua menuRepository. KHÔNG kiểm tra quyền và KHÔNG ghi nhật ký: việc đó do
 * MenuServiceProxy làm, route luôn gọi qua Proxy.
 *
 * Hợp đồng (cùng tên với MENU_SERVICE_METHODS trong MenuServiceProxy.js):
 *   listDrinks({ includeInactive })   → món (mặc định chỉ món đang bán)
 *   listToppings({ includeInactive })
 *   createDrink({ categoryId, name, basePrice, description, image, isBestSeller }) → món mới (isActive true)
 *   updateDrink(id, changes)          → món sau khi sửa (chỉ các trường cho phép, kể cả isActive)
 *   deactivateDrink(id)               → món với isActive false
 *   createTopping({ name, price }), updateTopping(id, changes), deactivateTopping(id)
 *   Lỗi: HttpError(400) kèm field khi dữ liệu sai · HttpError(404) khi không có món/topping
 */
import { HttpError } from '../middlewares/errorHandler.js';
import { menuRepository } from '../repositories/menuRepository.js';

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const invalid = (field, message) => Object.assign(new HttpError(400, message), { field });

const isPrice = (value) => Number.isInteger(value) && value >= 0;

function cleanName(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw invalid('name', `Vui lòng nhập tên ${label}`);
  const name = value.trim();
  if (name.length > MAX_NAME_LENGTH) throw invalid('name', `Tên ${label} tối đa ${MAX_NAME_LENGTH} ký tự`);
  return name;
}

function cleanBoolean(value, field) {
  if (typeof value !== 'boolean') throw invalid(field, 'Giá trị phải là có/không (true/false)');
  return value;
}

/**
 * Kiểm tra và chuẩn hóa dữ liệu món (BR19). `partial` = true khi sửa: chỉ kiểm tra
 * các trường được gửi lên. Trường lạ (id, ...) bị bỏ qua.
 */
function cleanDrink(input, { partial = false } = {}) {
  const data = input ?? {};
  const has = (key) => !partial || data[key] !== undefined;
  const result = {};

  if (has('name')) result.name = cleanName(data.name, 'món');
  if (has('categoryId')) {
    if (!menuRepository.categoryExists(data.categoryId)) throw invalid('categoryId', 'Danh mục không tồn tại');
    result.categoryId = data.categoryId;
  }
  if (has('basePrice')) {
    if (!isPrice(data.basePrice)) throw invalid('basePrice', 'Giá phải là số nguyên VND không âm');
    result.basePrice = data.basePrice;
  }
  if (data.description !== undefined || !partial) {
    const description = data.description ?? '';
    if (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH) {
      throw invalid('description', `Mô tả là chữ, tối đa ${MAX_DESCRIPTION_LENGTH} ký tự`);
    }
    result.description = description.trim();
  }
  if (data.image !== undefined || !partial) {
    const image = data.image ?? null;
    if (image !== null && (typeof image !== 'string' || !/^(\/|https?:\/\/)\S+$/.test(image.trim()))) {
      throw invalid('image', 'Ảnh phải là đường dẫn bắt đầu bằng / hoặc http(s)://, để trống nếu chưa có');
    }
    result.image = image ? image.trim() : null;
  }
  if (data.isBestSeller !== undefined || !partial) {
    result.isBestSeller = cleanBoolean(data.isBestSeller ?? false, 'isBestSeller');
  }
  if (partial && data.isActive !== undefined) result.isActive = cleanBoolean(data.isActive, 'isActive');
  return result;
}

function cleanTopping(input, { partial = false } = {}) {
  const data = input ?? {};
  const has = (key) => !partial || data[key] !== undefined;
  const result = {};
  if (has('name')) result.name = cleanName(data.name, 'topping');
  if (has('price')) {
    if (!isPrice(data.price)) throw invalid('price', 'Giá phải là số nguyên VND không âm');
    result.price = data.price;
  }
  if (partial && data.isActive !== undefined) result.isActive = cleanBoolean(data.isActive, 'isActive');
  return result;
}

function drinkOr404(id) {
  const drink = menuRepository.findDrink(id);
  if (!drink) throw new HttpError(404, 'Không tìm thấy món');
  return drink;
}

function toppingOr404(id) {
  const topping = menuRepository.findTopping(id);
  if (!topping) throw new HttpError(404, 'Không tìm thấy topping');
  return topping;
}

export const menuService = {
  listDrinks({ includeInactive = false } = {}) {
    const drinks = menuRepository.getAllDrinks();
    return includeInactive ? drinks : drinks.filter((d) => d.isActive);
  },

  listToppings({ includeInactive = false } = {}) {
    const toppings = menuRepository.getAllToppings();
    return includeInactive ? toppings : toppings.filter((t) => t.isActive);
  },

  createDrink(data) {
    return menuRepository.createDrink({ ...cleanDrink(data), isActive: true });
  },

  updateDrink(id, changes) {
    drinkOr404(id);
    return menuRepository.updateDrink(id, cleanDrink(changes, { partial: true }));
  },

  /** BR23: không xóa hẳn, chỉ ngừng bán. Đơn cũ vẫn giữ tên và giá đã chụp lúc đặt. */
  deactivateDrink(id) {
    drinkOr404(id);
    return menuRepository.updateDrink(id, { isActive: false });
  },

  createTopping(data) {
    return menuRepository.createTopping({ ...cleanTopping(data), isActive: true });
  },

  updateTopping(id, changes) {
    toppingOr404(id);
    return menuRepository.updateTopping(id, cleanTopping(changes, { partial: true }));
  },

  deactivateTopping(id) {
    toppingOr404(id);
    return menuRepository.updateTopping(id, { isActive: false });
  },
};
