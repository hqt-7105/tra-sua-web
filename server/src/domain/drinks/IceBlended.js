import { BasicDrink } from '../Drink.js';

/**
 * ConcreteProduct của Factory Method (TV1): đá xay.
 * Đá được xay cùng nguyên liệu theo tỉ lệ cố định nên không chỉnh mức đá;
 * vẫn chỉnh được đường và thêm topping.
 */
export class IceBlended extends BasicDrink {
  getCategoryName() {
    return 'Đá xay';
  }

  getCustomization() {
    return { allowToppings: true, allowSugar: true, allowIce: false };
  }
}
