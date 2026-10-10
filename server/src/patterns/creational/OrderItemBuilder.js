/**
 * ============================================================================
 * PATTERN: Builder (Creational) — PHỤ TRÁCH: TV3          [Sprint 1 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Một món trong giỏ có nhiều thuộc tính tùy chọn (size, đường, đá, topping,
 *   số lượng, ghi chú). Constructor 7-8 tham số rất khó đọc và dễ truyền sai.
 *
 * Giải pháp:
 *   Dựng món theo từng bước bằng các hàm set...() nối chuỗi, có giá trị mặc
 *   định, và chỉ kiểm tra hợp lệ + tạo đối tượng cuối cùng ở build().
 *
 * Hợp đồng:
 *   const item = new OrderItemBuilder()
 *     .setDrink(drink)          // Drink (bắt buộc)
 *     .setSize('L')             // 'M' | 'L'              mặc định 'M'
 *     .setSugar(50)             // 0|30|50|70|100          mặc định 100
 *     .setIce(70)               // 0|30|50|70|100          mặc định 100
 *     .addTopping(topping)      // {id,name,price}, gọi nhiều lần được
 *     .setQuantity(2)           // số nguyên >= 1         mặc định 1
 *     .setNote('ít ngọt')       // chuỗi                   mặc định ''
 *     .build();                 // → OrderItem
 *
 *   OrderItem.unitPrice  = giá drink sau khi bọc topping (dùng addToppings của
 *                          Decorator có sẵn) + phụ thu size (options.json)
 *   OrderItem.totalPrice = unitPrice * quantity
 *   build() khi chưa setDrink → throw Error
 *   Giá trị không hợp lệ (size 'XL', sugar 40, quantity 0) → throw Error
 *   Sau build(), builder được reset để dựng món tiếp theo.
 *
 * Test chấp nhận: tests/builder.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */
// import { addToppings } from '../structural/ToppingDecorator.js';
import { menuRepository } from '../../repositories/menuRepository.js';

const todo = (method) => {
  throw new Error(`TODO(TV3): chưa cài OrderItemBuilder.${method}()`);
};

/** Product của Builder — bất biến sau khi tạo. */
export class OrderItem {
  constructor(props) {
    Object.assign(this, props);
    Object.freeze(this);
  }

  toJSON() {
    // TODO(TV3): trả về { drinkId, description, size, sugar, ice, toppings,
    //                     quantity, note, unitPrice, totalPrice }
    return { ...this };
  }
}

export class OrderItemBuilder {
  /** @param {object} options cấu hình size/đường/đá, mặc định đọc từ options.json */
  constructor(options = menuRepository.getOptions()) {
    this.options = options;
    this.reset();
  }

  reset() {
    // TODO(TV3): khởi tạo trạng thái mặc định từ this.options.defaults
    this.state = {};
    return this;
  }

  // eslint-disable-next-line no-unused-vars
  setDrink(drink) { return todo('setDrink'); }
  // eslint-disable-next-line no-unused-vars
  setSize(size) { return todo('setSize'); }
  // eslint-disable-next-line no-unused-vars
  setSugar(level) { return todo('setSugar'); }
  // eslint-disable-next-line no-unused-vars
  setIce(level) { return todo('setIce'); }
  // eslint-disable-next-line no-unused-vars
  addTopping(topping) { return todo('addTopping'); }
  // eslint-disable-next-line no-unused-vars
  setQuantity(quantity) { return todo('setQuantity'); }
  // eslint-disable-next-line no-unused-vars
  setNote(note) { return todo('setNote'); }
  build() { return todo('build'); }
}
