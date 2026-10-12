import { BasicDrink } from '../Drink.js';

/**
 * ConcreteProduct của Factory Method (TV1): trà sữa.
 * Chỉnh được mức đường, mức đá và thêm topping.
 */
export class MilkTea extends BasicDrink {
  getCategoryName() {
    return 'Trà sữa';
  }

  getCustomization() {
    return { allowToppings: true, allowSugar: true, allowIce: true };
  }
}
