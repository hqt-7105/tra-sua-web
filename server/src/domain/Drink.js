/**
 * Drink — lớp trừu tượng cho mọi đồ uống.
 *
 * Vai trò trong các pattern:
 *  - Decorator:      Component (ToppingDecorator bọc quanh một Drink)
 *  - Factory Method: Product   (DrinkCreator.createDrink() trả về một Drink)
 *
 * Giá tính bằng VND (số nguyên).
 */
export class Drink {
  constructor() {
    if (new.target === Drink) {
      throw new TypeError('Drink là lớp trừu tượng, hãy dùng lớp con (BasicDrink, MilkTea, ...)');
    }
  }

  /** @returns {string} */
  getId() {
    throw new Error(`${this.constructor.name} phải cài đặt getId()`);
  }

  /** Tên gốc của món, ví dụ "Trà sữa truyền thống" */
  getName() {
    throw new Error(`${this.constructor.name} phải cài đặt getName()`);
  }

  /** Giá hiện tại (đã cộng topping nếu được bọc bởi decorator) */
  getPrice() {
    throw new Error(`${this.constructor.name} phải cài đặt getPrice()`);
  }

  /** Mô tả hiển thị, ví dụ "Trà sữa truyền thống + Trân châu đen" */
  getDescription() {
    throw new Error(`${this.constructor.name} phải cài đặt getDescription()`);
  }

  /** Danh sách topping đã thêm */
  getToppings() {
    return [];
  }

  toJSON() {
    return {
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      price: this.getPrice(),
      toppings: this.getToppings(),
    };
  }
}

/**
 * BasicDrink — đồ uống cụ thể chưa có topping.
 * TV1 sẽ tạo các lớp con MilkTea, FruitTea, Coffee, IceBlended kế thừa lớp này.
 */
export class BasicDrink extends Drink {
  constructor({ id, name, basePrice, categoryId = null, description = '' }) {
    super();
    if (!id || !name) throw new TypeError('Đồ uống phải có id và name');
    if (!Number.isInteger(basePrice) || basePrice < 0) {
      throw new TypeError('basePrice phải là số nguyên không âm (VND)');
    }
    this.id = id;
    this.name = name;
    this.basePrice = basePrice;
    this.categoryId = categoryId;
    this.summary = description; // mô tả marketing lấy từ dữ liệu
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getPrice() {
    return this.basePrice;
  }

  getDescription() {
    return this.name;
  }
}
