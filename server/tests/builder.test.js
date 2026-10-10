// Builder — TV3. Khi cài xong, XÓA `{ todo: 'TV3' }` ở từng test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BasicDrink } from '../src/domain/Drink.js';
import { OrderItemBuilder } from '../src/patterns/creational/OrderItemBuilder.js';

const milkTea = () =>
  new BasicDrink({ id: 'ts-truyen-thong', name: 'Trà sữa truyền thống', basePrice: 35000 });
const pearl = { id: 'tran-chau-den', name: 'Trân châu đen', price: 5000 };
const pudding = { id: 'pudding', name: 'Pudding trứng', price: 7000 };

const TODO = { todo: 'TV3' };

test('giá trị mặc định: size M, đường 100, đá 100, số lượng 1', TODO, () => {
  const item = new OrderItemBuilder().setDrink(milkTea()).build();
  assert.equal(item.size, 'M');
  assert.equal(item.sugar, 100);
  assert.equal(item.ice, 100);
  assert.equal(item.quantity, 1);
  assert.equal(item.unitPrice, 35000);
});

test('size L + 2 topping + số lượng 2 tính đúng giá', TODO, () => {
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

test('build() khi chưa chọn đồ uống thì báo lỗi', TODO, () => {
  assert.throws(() => new OrderItemBuilder().setSize('L').build());
});

test('từ chối giá trị không hợp lệ', TODO, () => {
  const builder = new OrderItemBuilder().setDrink(milkTea());
  assert.throws(() => builder.setSize('XL'));
  assert.throws(() => builder.setSugar(40));
  assert.throws(() => builder.setIce(120));
  assert.throws(() => builder.setQuantity(0));
});

test('builder được reset sau build()', TODO, () => {
  const builder = new OrderItemBuilder();
  builder.setDrink(milkTea()).setSize('L').addTopping(pearl).build();
  const second = builder.setDrink(milkTea()).build();
  assert.equal(second.size, 'M');
  assert.equal(second.unitPrice, 35000);
});

test('OrderItem bất biến sau khi tạo', TODO, () => {
  const item = new OrderItemBuilder().setDrink(milkTea()).build();
  assert.throws(() => {
    'use strict';
    item.quantity = 99;
  });
});
