/**
 * ============================================================================
 * PATTERN: Builder (Creational) — PHỤ TRÁCH: TV3
 * ============================================================================
 * Vấn đề:
 *   Một món trong giỏ có nhiều thuộc tính tùy chọn (size, đường, đá, topping,
 *   số lượng, ghi chú). Constructor 7-8 tham số rất khó đọc và dễ truyền sai.
 *
 * Giải pháp:
 *   Dựng món theo từng bước bằng các hàm set...() nối chuỗi, có giá trị mặc
 *   định, và chỉ kiểm tra hợp lệ + tạo đối tượng cuối cùng ở build().
 *
 * Cấu trúc GoF:
 *   Builder / ConcreteBuilder = OrderItemBuilder (các bước set...(), addTopping(), build())
 *   Product                   = OrderItem (bất biến sau khi tạo)
 *   Director                  = createOrderItem() (src/services/orderItemService.js):
 *                               đọc một dòng món từ request rồi gọi các bước theo thứ tự
 *   Client                    = route POST /api/cart/price, OrderFacade (Sprint 2)
 *
 *   Phối hợp với pattern khác:
 *     - Decorator: build() bọc topping bằng addToppings() nên giá và mô tả topping
 *       do ToppingDecorator tính, Builder không tự cộng tay.
 *     - Factory Method: drink do createDrinkFromData() tạo, tự khai báo
 *       getCustomization(); build() từ chối topping cho cà phê, mức đá cho đá xay.
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
 *     (cụ thể là InvalidOrderItemError, có `field` cho biết thuộc tính nào sai)
 *   Sau build(), builder được reset để dựng món tiếp theo.
 *
 * Ví dụ sử dụng:
 *   const item = new OrderItemBuilder()
 *     .setDrink(createDrinkFromData(traSuaData))   // 35.000đ
 *     .setSize('L')                                // +6.000đ
 *     .addTopping(tranChauDen)                     // +5.000đ
 *     .addTopping(pudding)                         // +7.000đ
 *     .setQuantity(2)
 *     .build();
 *   item.unitPrice;   // 53000
 *   item.totalPrice;  // 106000
 *   item.description; // "Trà sữa truyền thống + Trân châu đen + Pudding trứng"
 *
 * Test chấp nhận: tests/builder.test.js
 * ============================================================================
 */
import { Drink } from '../../domain/Drink.js';
import { addToppings } from '../structural/ToppingDecorator.js';
import { menuRepository } from '../../repositories/menuRepository.js';

/** Đồ uống không tự khai báo quy tắc (ví dụ BasicDrink) thì được tùy chỉnh đầy đủ. */
const FULL_CUSTOMIZATION = { allowToppings: true, allowSugar: true, allowIce: true };

/** Lỗi dựng món: `field` là thuộc tính sai (drink, size, sugar, ice, toppings, quantity, note). */
export class InvalidOrderItemError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'InvalidOrderItemError';
    this.field = field;
  }
}

const fail = (field, message) => {
  throw new InvalidOrderItemError(field, message);
};

/** Product của Builder — bất biến sau khi tạo. */
export class OrderItem {
  constructor(props) {
    Object.assign(this, props);
    Object.freeze(this);
  }

  toJSON() {
    return {
      drinkId: this.drinkId,
      description: this.description,
      size: this.size,
      sugar: this.sugar,
      ice: this.ice,
      toppings: this.toppings.map((topping) => ({ ...topping })),
      quantity: this.quantity,
      note: this.note,
      unitPrice: this.unitPrice,
      totalPrice: this.totalPrice,
    };
  }
}

export class OrderItemBuilder {
  /** @param {object} options cấu hình size/đường/đá, mặc định đọc từ options.json */
  constructor(options = menuRepository.getOptions()) {
    this.options = options;
    this.reset();
  }

  reset() {
    const { size, sugar, ice, quantity } = this.options.defaults;
    this.state = { drink: null, size, sugar, ice, toppings: [], quantity, note: '' };
    return this;
  }

  setDrink(drink) {
    if (!(drink instanceof Drink)) fail('drink', 'Đồ uống không hợp lệ');
    this.state.drink = drink;
    return this;
  }

  setSize(size) {
    const sizeIds = this.options.sizes.map((s) => s.id);
    if (!sizeIds.includes(size)) {
      fail('size', `Size "${size}" không hợp lệ, chỉ chọn được ${sizeIds.join(' hoặc ')}`);
    }
    this.state.size = size;
    return this;
  }

  setSugar(level) {
    this.state.sugar = this.#checkLevel('sugar', 'đường', this.options.sugarLevels, level);
    return this;
  }

  setIce(level) {
    this.state.ice = this.#checkLevel('ice', 'đá', this.options.iceLevels, level);
    return this;
  }

  addTopping(topping) {
    const { id, name, price } = topping ?? {};
    if (!id || !name || !Number.isInteger(price) || price < 0) {
      fail('toppings', 'Topping không hợp lệ');
    }
    this.state.toppings.push({ id, name, price });
    return this;
  }

  setQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      fail('quantity', 'Số lượng phải là số nguyên từ 1 trở lên');
    }
    this.state.quantity = quantity;
    return this;
  }

  setNote(note) {
    if (typeof note !== 'string') fail('note', 'Ghi chú phải là chữ');
    this.state.note = note.trim();
    return this;
  }

  build() {
    const { drink, size, sugar, ice, toppings, quantity, note } = this.state;
    if (!drink) fail('drink', 'Chưa chọn đồ uống');
    this.#checkCustomization();

    // Decorator cộng giá và nối mô tả topping; Builder chỉ cộng thêm phụ thu size.
    const decorated = addToppings(drink, toppings);
    const sizeExtra = this.options.sizes.find((s) => s.id === size).extraPrice;
    const unitPrice = decorated.getPrice() + sizeExtra;

    const item = new OrderItem({
      drinkId: drink.getId(),
      description: decorated.getDescription(),
      size,
      sugar,
      ice,
      toppings: Object.freeze(decorated.getToppings().map((t) => Object.freeze({ ...t }))),
      quantity,
      note,
      unitPrice,
      totalPrice: unitPrice * quantity,
    });
    this.reset();
    return item;
  }

  #checkLevel(field, label, levels, level) {
    if (!levels.includes(level)) {
      fail(field, `Mức ${label} ${level}% không hợp lệ, chỉ chọn được ${levels.join(', ')}%`);
    }
    return level;
  }

  /** Quy tắc riêng của từng loại đồ uống (Factory Method): cà phê không topping, đá xay không chỉnh đá. */
  #checkCustomization() {
    const { drink, sugar, ice, toppings } = this.state;
    const rules = typeof drink.getCustomization === 'function' ? drink.getCustomization() : FULL_CUSTOMIZATION;
    const { defaults } = this.options;
    const name = drink.getName();
    if (!rules.allowToppings && toppings.length > 0) fail('toppings', `${name} không thêm được topping`);
    if (!rules.allowSugar && sugar !== defaults.sugar) fail('sugar', `${name} không chỉnh được mức đường`);
    if (!rules.allowIce && ice !== defaults.ice) fail('ice', `${name} không chỉnh được mức đá`);
  }
}
