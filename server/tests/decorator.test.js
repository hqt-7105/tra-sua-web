// Decorator — đã cài trong Sprint 0, tất cả test phải PASS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BasicDrink } from '../src/domain/Drink.js';
import { ToppingDecorator, addToppings } from '../src/patterns/structural/ToppingDecorator.js';

const milkTea = () =>
  new BasicDrink({ id: 'ts-truyen-thong', name: 'Trà sữa truyền thống', basePrice: 35000 });
const pearl = { id: 'tran-chau-den', name: 'Trân châu đen', price: 5000 };
const pudding = { id: 'pudding', name: 'Pudding trứng', price: 7000 };

test('đồ uống chưa có topping giữ nguyên giá gốc', () => {
  const drink = milkTea();
  assert.equal(drink.getPrice(), 35000);
  assert.equal(drink.getDescription(), 'Trà sữa truyền thống');
  assert.deepEqual(drink.getToppings(), []);
});

test('trà sữa 35k + trân châu 5k + pudding 7k = 47k', () => {
  const drink = new ToppingDecorator(new ToppingDecorator(milkTea(), pearl), pudding);
  assert.equal(drink.getPrice(), 47000);
  assert.equal(drink.getDescription(), 'Trà sữa truyền thống + Trân châu đen + Pudding trứng');
  assert.deepEqual(
    drink.getToppings().map((t) => t.id),
    ['tran-chau-den', 'pudding'],
  );
});

test('thêm cùng một topping 2 lần thì cộng 2 lần', () => {
  const drink = addToppings(milkTea(), [pearl, pearl]);
  assert.equal(drink.getPrice(), 45000);
});

test('decorator không làm thay đổi đối tượng gốc', () => {
  const base = milkTea();
  addToppings(base, [pearl, pudding]);
  assert.equal(base.getPrice(), 35000);
});

test('id và tên gốc được giữ qua các lớp bọc', () => {
  const drink = addToppings(milkTea(), [pearl]);
  assert.equal(drink.getId(), 'ts-truyen-thong');
  assert.equal(drink.getName(), 'Trà sữa truyền thống');
});

test('toJSON trả về đủ thông tin cho API', () => {
  const json = addToppings(milkTea(), [pearl]).toJSON();
  assert.deepEqual(json, {
    id: 'ts-truyen-thong',
    name: 'Trà sữa truyền thống',
    description: 'Trà sữa truyền thống + Trân châu đen',
    price: 40000,
    toppings: [pearl],
  });
});

test('từ chối bọc đối tượng không phải Drink hoặc topping sai giá', () => {
  assert.throws(() => new ToppingDecorator({ getPrice: () => 1 }, pearl), TypeError);
  assert.throws(() => new ToppingDecorator(milkTea(), { ...pearl, price: -1000 }), TypeError);
});
