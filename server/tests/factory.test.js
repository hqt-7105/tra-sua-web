// Factory Method — TV1. Test chấp nhận đã bật toàn bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Drink, BasicDrink } from '../src/domain/Drink.js';
import { createDrinkFromData, DrinkCreator } from '../src/patterns/creational/DrinkFactory.js';

const sample = (categoryId) => ({
  id: `sample-${categoryId}`,
  categoryId,
  name: `Món mẫu ${categoryId}`,
  basePrice: 30000,
  description: '',
});

test('tạo đúng lớp theo categoryId', () => {
  assert.equal(createDrinkFromData(sample('tra-sua')).constructor.name, 'MilkTea');
  assert.equal(createDrinkFromData(sample('tra-trai-cay')).constructor.name, 'FruitTea');
  assert.equal(createDrinkFromData(sample('ca-phe')).constructor.name, 'Coffee');
  assert.equal(createDrinkFromData(sample('da-xay')).constructor.name, 'IceBlended');
});

test('sản phẩm tạo ra là Drink và giữ đúng giá gốc', () => {
  const drink = createDrinkFromData(sample('tra-sua'));
  assert.ok(drink instanceof Drink);
  assert.equal(drink.getPrice(), 30000);
  assert.equal(drink.getName(), 'Món mẫu tra-sua');
});

test('sản phẩm là lớp con riêng, Creator gốc không tự tạo được (không phải Simple Factory)', () => {
  const drink = createDrinkFromData(sample('ca-phe'));
  assert.notEqual(Object.getPrototypeOf(drink), BasicDrink.prototype);
  assert.throws(() => new DrinkCreator().createDrink(sample('tra-sua')));
});

test('categoryId không hỗ trợ thì báo lỗi', () => {
  assert.throws(() => createDrinkFromData(sample('banh-mi')), /Không hỗ trợ/);
});
