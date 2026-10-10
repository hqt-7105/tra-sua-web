/**
 * ============================================================================
 * PATTERN: Factory Method (Creational) — PHỤ TRÁCH: TV1   [Sprint 1 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Mỗi loại đồ uống có quy tắc riêng (ví dụ: đá xay không chỉnh mức đá,
 *   cà phê không thêm trân châu). Route/service không nên tự `new` đúng lớp.
 *
 * Cấu trúc GoF cần cài:
 *   Product          = Drink                         (src/domain/Drink.js, có sẵn)
 *   ConcreteProduct  = MilkTea, FruitTea, Coffee, IceBlended
 *                      → tạo trong src/domain/drinks/, kế thừa BasicDrink
 *   Creator          = DrinkCreator (lớp dưới đây, có factory method createDrink)
 *   ConcreteCreator  = MilkTeaCreator, FruitTeaCreator, CoffeeCreator, IceBlendedCreator
 *
 * LƯU Ý: Một hàm switch-case duy nhất là "Simple Factory", KHÔNG phải
 * Factory Method của GoF. Hãy để mỗi ConcreteCreator override createDrink().
 *
 * Hợp đồng (các phần khác của dự án sẽ gọi đúng như sau):
 *   createDrinkFromData(drinkData)  → instance của lớp con Drink theo categoryId
 *     drinkData: bản ghi trong src/data/drinks.json
 *     categoryId không hỗ trợ → throw Error
 *
 * Test chấp nhận: tests/factory.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */
// import { MilkTea } from '../../domain/drinks/MilkTea.js';

/** Creator trừu tượng */
export class DrinkCreator {
  /**
   * Factory method — lớp con bắt buộc override.
   * @param {object} drinkData
   * @returns {import('../../domain/Drink.js').Drink}
   */
  // eslint-disable-next-line no-unused-vars
  createDrink(drinkData) {
    throw new Error(`TODO(TV1): ${this.constructor.name} chưa override createDrink()`);
  }

  /**
   * Thao tác dùng factory method (lớp con không cần sửa).
   * TODO(TV1): kiểm tra dữ liệu đầu vào, gọi createDrink(), đảm bảo kết quả là Drink.
   */
  create(drinkData) {
    return this.createDrink(drinkData);
  }
}

// TODO(TV1): class MilkTeaCreator extends DrinkCreator { createDrink(data) { return new MilkTea(data); } }
// TODO(TV1): FruitTeaCreator, CoffeeCreator, IceBlendedCreator

/** Bảng ánh xạ categoryId → ConcreteCreator */
const creators = {
  // 'tra-sua': new MilkTeaCreator(),
  // 'tra-trai-cay': new FruitTeaCreator(),
  // 'ca-phe': new CoffeeCreator(),
  // 'da-xay': new IceBlendedCreator(),
};

export function createDrinkFromData(drinkData) {
  const creator = creators[drinkData?.categoryId];
  if (!creator) {
    throw new Error(`Không hỗ trợ loại đồ uống: ${drinkData?.categoryId}`);
  }
  return creator.create(drinkData);
}
