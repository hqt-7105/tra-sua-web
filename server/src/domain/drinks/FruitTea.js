import { BasicDrink } from '../Drink.js';

/**
 * ConcreteProduct của Factory Method (TV1): trà trái cây.
 * Chỉnh được mức đường, mức đá và thêm topping (thạch, trân châu trắng...).
 */
export class FruitTea extends BasicDrink {
  getCategoryName() {
    return 'Trà trái cây';
  }

  getCustomization() {
    return { allowToppings: true, allowSugar: true, allowIce: true };
  }
}
