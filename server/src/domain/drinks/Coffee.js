import { BasicDrink } from '../Drink.js';

/**
 * ConcreteProduct của Factory Method (TV1): cà phê.
 * Pha phin theo công thức nên không thêm topping; vẫn chỉnh được đường và đá.
 */
export class Coffee extends BasicDrink {
  getCategoryName() {
    return 'Cà phê';
  }

  getCustomization() {
    return { allowToppings: false, allowSugar: true, allowIce: true };
  }
}
