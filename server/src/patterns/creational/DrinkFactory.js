/**
 * ============================================================================
 * PATTERN: Factory Method (Creational) — PHỤ TRÁCH: TV1
 * ============================================================================
 * Vấn đề:
 *   Mỗi loại đồ uống có quy tắc riêng (ví dụ: đá xay không chỉnh mức đá,
 *   cà phê không thêm trân châu). Route/service không nên tự `new` đúng lớp.
 *
 * Giải pháp:
 *   Mỗi loại đồ uống có một Creator riêng. Lớp DrinkCreator giữ phần chung
 *   (kiểm tra dữ liệu, bảo đảm kết quả là Drink) trong create(), còn việc
 *   "tạo lớp nào" để lớp con quyết định qua factory method createDrink().
 *   Nơi dùng chỉ gọi createDrinkFromData(data), không biết tới MilkTea hay
 *   Coffee. Thêm loại mới = thêm 1 Product + 1 Creator + 1 dòng đăng ký,
 *   không sửa code đang chạy.
 *
 * Cấu trúc GoF:
 *   Product          = Drink                         (src/domain/Drink.js)
 *   ConcreteProduct  = MilkTea, FruitTea, Coffee, IceBlended
 *                      (src/domain/drinks/, kế thừa BasicDrink, mỗi lớp tự
 *                       khai báo getCategoryName() và getCustomization())
 *   Creator          = DrinkCreator (factory method createDrink, thao tác create)
 *   ConcreteCreator  = MilkTeaCreator, FruitTeaCreator, CoffeeCreator, IceBlendedCreator
 *   Client           = route GET /api/drinks, dịch vụ dựng dòng món (Builder)
 *
 * LƯU Ý: Một hàm switch-case duy nhất là "Simple Factory", KHÔNG phải
 * Factory Method của GoF. Ở đây mỗi ConcreteCreator override createDrink().
 *
 * Hợp đồng (các phần khác của dự án sẽ gọi đúng như sau):
 *   createDrinkFromData(drinkData)  → instance của lớp con Drink theo categoryId
 *     drinkData: bản ghi trong src/data/drinks.json
 *     categoryId không hỗ trợ → throw Error
 *
 * Ví dụ sử dụng:
 *   const drink = createDrinkFromData({ id: 'cf-muoi', categoryId: 'ca-phe',
 *                                       name: 'Cà phê muối', basePrice: 35000 });
 *   drink.constructor.name;              // 'Coffee'
 *   drink.getCategoryName();             // 'Cà phê'
 *   drink.getCustomization();            // { allowToppings: false, allowSugar: true, allowIce: true }
 *   new DrinkCreator().createDrink(data) // Error: Creator gốc không tự tạo
 *
 * Test chấp nhận: tests/factory.test.js
 * ============================================================================
 */
import { Drink } from '../../domain/Drink.js';
import { MilkTea } from '../../domain/drinks/MilkTea.js';
import { FruitTea } from '../../domain/drinks/FruitTea.js';
import { Coffee } from '../../domain/drinks/Coffee.js';
import { IceBlended } from '../../domain/drinks/IceBlended.js';

/** Creator trừu tượng */
export class DrinkCreator {
  /**
   * Factory method — lớp con bắt buộc override.
   * @param {object} drinkData
   * @returns {import('../../domain/Drink.js').Drink}
   */
  // eslint-disable-next-line no-unused-vars
  createDrink(drinkData) {
    throw new Error(`${this.constructor.name} phải override createDrink()`);
  }

  /** Thao tác dùng factory method (lớp con không cần sửa). */
  create(drinkData) {
    if (!drinkData || typeof drinkData !== 'object') {
      throw new TypeError('Thiếu dữ liệu đồ uống');
    }
    const drink = this.createDrink(drinkData);
    if (!(drink instanceof Drink)) {
      throw new TypeError(`${this.constructor.name}.createDrink() phải trả về một Drink`);
    }
    return drink;
  }
}

export class MilkTeaCreator extends DrinkCreator {
  createDrink(drinkData) {
    return new MilkTea(drinkData);
  }
}

export class FruitTeaCreator extends DrinkCreator {
  createDrink(drinkData) {
    return new FruitTea(drinkData);
  }
}

export class CoffeeCreator extends DrinkCreator {
  createDrink(drinkData) {
    return new Coffee(drinkData);
  }
}

export class IceBlendedCreator extends DrinkCreator {
  createDrink(drinkData) {
    return new IceBlended(drinkData);
  }
}

/** Bảng ánh xạ categoryId → ConcreteCreator */
const creators = new Map([
  ['tra-sua', new MilkTeaCreator()],
  ['tra-trai-cay', new FruitTeaCreator()],
  ['ca-phe', new CoffeeCreator()],
  ['da-xay', new IceBlendedCreator()],
]);

export function createDrinkFromData(drinkData) {
  const creator = creators.get(drinkData?.categoryId);
  if (!creator) {
    throw new Error(`Không hỗ trợ loại đồ uống: ${drinkData?.categoryId}`);
  }
  return creator.create(drinkData);
}
