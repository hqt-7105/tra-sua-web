// Builder — TV3. Test chấp nhận đã bật toàn bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BasicDrink } from '../src/domain/Drink.js';
import { OrderItemBuilder, InvalidOrderItemError } from '../src/patterns/creational/OrderItemBuilder.js';
import { createDrinkFromData } from '../src/patterns/creational/DrinkFactory.js';

const milkTea = () =>
  new BasicDrink({ id: 'ts-truyen-thong', name: 'Trà sữa truyền thống', basePrice: 35000 });
const pearl = { id: 'tran-chau-den', name: 'Trân châu đen', price: 5000 };
const pudding = { id: 'pudding', name: 'Pudding trứng', price: 7000 };

test('giá trị mặc định: size M, đường 100, đá 100, số lượng 1', () => {
  const item = new OrderItemBuilder().setDrink(milkTea()).build();
  assert.equal(item.size, 'M');
  assert.equal(item.sugar, 100);
  assert.equal(item.ice, 100);
  assert.equal(item.quantity, 1);
  assert.equal(item.unitPrice, 35000);
});

test('size L + 2 topping + số lượng 2 tính đúng giá', () => {
  const item = new OrderItemBuilder()
    .setDrink(milkTea())
    .setSize('L') // +6000
    .addTopping(pearl) // +5000
    .addTopping(pudding) // +7000
    .setQuantity(2)
    .build();
  assert.equal(item.unitPrice, 53000);
  assert.equal(item.totalPrice, 106000);
  assert.match(item.description, /Trân châu đen/);
});

test('build() khi chưa chọn đồ uống thì báo lỗi', () => {
  assert.throws(() => new OrderItemBuilder().setSize('L').build());
});

test('từ chối giá trị không hợp lệ', () => {
  const builder = new OrderItemBuilder().setDrink(milkTea());
  assert.throws(() => builder.setSize('XL'));
  assert.throws(() => builder.setSugar(40));
  assert.throws(() => builder.setIce(120));
  assert.throws(() => builder.setQuantity(0));
});

test('builder được reset sau build()', () => {
  const builder = new OrderItemBuilder();
  builder.setDrink(milkTea()).setSize('L').addTopping(pearl).build();
  const second = builder.setDrink(milkTea()).build();
  assert.equal(second.size, 'M');
  assert.equal(second.unitPrice, 35000);
});

test('OrderItem bất biến sau khi tạo', () => {
  const item = new OrderItemBuilder().setDrink(milkTea()).build();
  assert.throws(() => {
    'use strict';
    item.quantity = 99;
  });
});

// --- Bổ sung (TV3): Builder phối hợp với Factory Method và Decorator ---

test('quy tắc của từng loại đồ uống (Factory Method) được kiểm tra ở build()', () => {
  const coffee = createDrinkFromData({ id: 'cf-muoi', categoryId: 'ca-phe', name: 'Cà phê muối', basePrice: 35000 });
  assert.throws(
    () => new OrderItemBuilder().setDrink(coffee).addTopping(pearl).build(),
    (err) => err instanceof InvalidOrderItemError && err.field === 'toppings',
  );

  const iceBlended = () =>
    createDrinkFromData({ id: 'dx-socola', categoryId: 'da-xay', name: 'Socola đá xay', basePrice: 49000 });
  assert.throws(
    () => new OrderItemBuilder().setDrink(iceBlended()).setIce(70).build(),
    (err) => err.field === 'ice',
  );
  const item = new OrderItemBuilder().setDrink(iceBlended()).addTopping(pudding).build();
  assert.equal(item.unitPrice, 56000);
  assert.equal(item.ice, null, 'món không chỉnh đá thì ice = null (không áp dụng)');
  assert.equal(item.sugar, 100);
});

test('toJSON trả đúng các trường của hợp đồng, topping lấy từ Decorator', () => {
  const item = new OrderItemBuilder()
    .setDrink(milkTea())
    .addTopping(pearl)
    .addTopping(pearl)
    .setNote('  ít ngọt  ')
    .build();
  assert.deepEqual(item.toJSON(), {
    drinkId: 'ts-truyen-thong',
    description: 'Trà sữa truyền thống + Trân châu đen + Trân châu đen',
    size: 'M',
    sugar: 100,
    ice: 100,
    toppings: [pearl, pearl],
    quantity: 1,
    note: 'ít ngọt',
    unitPrice: 45000,
    totalPrice: 45000,
  });
  assert.ok(Object.isFrozen(item.toppings));
});
