/**
 * ============================================================================
 * PATTERN: Decorator (Structural) — CÀI SẴN LÀM MẪU (Sprint 0)
 * ============================================================================
 * Vấn đề:
 *   Một ly trà sữa có thể thêm 0..n topping với mọi tổ hợp. Nếu dùng kế thừa
 *   (TraSuaTranChau, TraSuaTranChauPudding, ...) số lớp sẽ bùng nổ.
 *
 * Giải pháp:
 *   Mỗi topping là một "lớp vỏ" bọc quanh đồ uống. Vỏ có cùng interface Drink
 *   nên có thể bọc nhiều lớp, mỗi lớp cộng thêm giá và mô tả của mình.
 *
 * Cấu trúc GoF:
 *   Component          = Drink              (src/domain/Drink.js)
 *   ConcreteComponent  = BasicDrink, MilkTea, ... (src/domain/)
 *   Decorator          = DrinkDecorator     (file này)
 *   ConcreteDecorator  = ToppingDecorator   (file này)
 *
 * Vì sao chỉ có MỘT ConcreteDecorator thay vì PearlDecorator, PuddingDecorator...?
 *   Topping do admin quản lý trong CSDL (thêm/xóa/đổi giá). Nếu mỗi topping
 *   là một lớp thì thêm topping mới phải sửa code. ToppingDecorator nhận dữ
 *   liệu topping qua constructor nên thêm topping chỉ cần thêm dữ liệu.
 *
 * Ví dụ:
 *   let drink = new BasicDrink({ id: 'ts', name: 'Trà sữa', basePrice: 35000 });
 *   drink = new ToppingDecorator(drink, { id: 'tc', name: 'Trân châu', price: 5000 });
 *   drink = new ToppingDecorator(drink, { id: 'pd', name: 'Pudding',   price: 7000 });
 *   drink.getPrice();       // 47000
 *   drink.getDescription(); // "Trà sữa + Trân châu + Pudding"
 * ============================================================================
 */
import { Drink } from '../../domain/Drink.js';

/** Decorator trừu tượng: giữ tham chiếu tới Drink bên trong và ủy quyền mọi lời gọi. */
export class DrinkDecorator extends Drink {
  /** @param {Drink} drink */
  constructor(drink) {
    super();
    if (!(drink instanceof Drink)) {
      throw new TypeError('Decorator chỉ bọc được đối tượng Drink');
    }
    this.wrapped = drink;
  }

  getId() {
    return this.wrapped.getId();
  }

  getName() {
    return this.wrapped.getName();
  }

  getPrice() {
    return this.wrapped.getPrice();
  }

  getDescription() {
    return this.wrapped.getDescription();
  }

  getToppings() {
    return this.wrapped.getToppings();
  }
}

/** Decorator cụ thể: thêm một topping (cộng giá + nối mô tả). */
export class ToppingDecorator extends DrinkDecorator {
  /**
   * @param {Drink} drink
   * @param {{ id: string, name: string, price: number }} topping
   */
  constructor(drink, topping) {
    super(drink);
    if (!topping || !topping.id || !topping.name) {
      throw new TypeError('Topping phải có id và name');
    }
    if (!Number.isInteger(topping.price) || topping.price < 0) {
      throw new TypeError('Giá topping phải là số nguyên không âm (VND)');
    }
    this.topping = { id: topping.id, name: topping.name, price: topping.price };
  }

  getPrice() {
    return super.getPrice() + this.topping.price;
  }

  getDescription() {
    return `${super.getDescription()} + ${this.topping.name}`;
  }

  getToppings() {
    return [...super.getToppings(), this.topping];
  }
}

/**
 * Tiện ích: bọc lần lượt nhiều topping.
 * @param {Drink} drink
 * @param {Array<{id:string,name:string,price:number}>} toppings
 * @returns {Drink}
 */
export function addToppings(drink, toppings = []) {
  return toppings.reduce((decorated, topping) => new ToppingDecorator(decorated, topping), drink);
}
