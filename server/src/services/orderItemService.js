/**
 * Dựng dòng món từ dữ liệu khách gửi lên — PHỤ TRÁCH: TV3 (Sprint 1).
 * Đóng vai Director của Builder: đọc một dòng món, lấy dữ liệu gốc từ menu,
 * nhờ Factory Method tạo đúng loại đồ uống rồi gọi các bước của
 * OrderItemBuilder theo thứ tự. Giá luôn tính ở server (BR02), mọi trường giá
 * gửi lên đều bị bỏ qua.
 *
 * Hợp đồng (Sprint 2: OrderFacade nhận hàm này làm `createItem`):
 *   createOrderItem(line) → OrderItem
 *     line = { drinkId, size, sugar, ice, toppingIds, quantity, note }
 *            thiếu size/sugar/ice/quantity/note thì dùng mặc định (BR03)
 *     món hoặc topping không có / ngừng bán → HttpError(404)
 *     giá trị sai → HttpError(400) kèm field: drinkId, size, sugar, ice, toppingIds, quantity, note
 */
import { config } from '../config.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { menuRepository } from '../repositories/menuRepository.js';
import { createDrinkFromData } from '../patterns/creational/DrinkFactory.js';
import { OrderItemBuilder, InvalidOrderItemError } from '../patterns/creational/OrderItemBuilder.js';

const MAX_NOTE_LENGTH = 200;

const invalid = (field, message) => Object.assign(new HttpError(400, message), { field });

/** Tên thuộc tính trong Builder → tên ô trong request. */
const REQUEST_FIELD = { drink: 'drinkId', toppings: 'toppingIds' };

function findDrinkData(drinkId) {
  if (typeof drinkId !== 'string' || !drinkId) {
    throw invalid('drinkId', 'Vui lòng chọn món');
  }
  const drinkData = menuRepository.getDrinkById(drinkId);
  if (!drinkData) throw new HttpError(404, 'Không tìm thấy món');
  return drinkData;
}

function findToppings(toppingIds = []) {
  if (!Array.isArray(toppingIds) || !toppingIds.every((id) => typeof id === 'string')) {
    throw invalid('toppingIds', 'Danh sách topping không hợp lệ');
  }
  return toppingIds.map((id) => {
    const topping = menuRepository.getToppingById(id);
    if (!topping) throw new HttpError(404, `Không tìm thấy topping "${id}"`);
    return topping;
  });
}

export function createOrderItem(line) {
  const { drinkId, size, sugar, ice, toppingIds, quantity, note } = line ?? {};
  const drinkData = findDrinkData(drinkId);
  const toppings = findToppings(toppingIds ?? []);
  if (Number.isInteger(quantity) && quantity > config.maxQuantityPerItem) {
    throw invalid('quantity', `Mỗi món đặt tối đa ${config.maxQuantityPerItem} ly`);
  }
  if (typeof note === 'string' && note.trim().length > MAX_NOTE_LENGTH) {
    throw invalid('note', `Ghi chú tối đa ${MAX_NOTE_LENGTH} ký tự`);
  }

  try {
    const builder = new OrderItemBuilder().setDrink(createDrinkFromData(drinkData));
    if (size != null) builder.setSize(size);
    if (sugar != null) builder.setSugar(sugar);
    if (ice != null) builder.setIce(ice);
    toppings.forEach((topping) => builder.addTopping(topping));
    if (quantity != null) builder.setQuantity(quantity);
    if (note != null) builder.setNote(note);
    return builder.build();
  } catch (err) {
    if (err instanceof InvalidOrderItemError) {
      throw invalid(REQUEST_FIELD[err.field] ?? err.field, err.message);
    }
    throw err;
  }
}
