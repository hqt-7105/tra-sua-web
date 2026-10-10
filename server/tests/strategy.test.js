// Strategy — TV4. Khi cài xong, XÓA `{ todo: 'TV4' }` ở từng test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NoDiscount,
  PercentDiscount,
  FixedDiscount,
  FreeShipping,
  DiscountContext,
  createDiscountStrategy,
} from '../src/patterns/behavioral/DiscountStrategy.js';

const cart = { subtotal: 100000, shippingFee: 15000 };
const TODO = { todo: 'TV4' };

test('NoDiscount không giảm gì', () => {
  assert.equal(new NoDiscount().calculate(cart), 0);
});

test('PercentDiscount giảm theo %, có trần tối đa', TODO, () => {
  assert.equal(new PercentDiscount(10).calculate(cart), 10000);
  assert.equal(new PercentDiscount(50, 20000).calculate(cart), 20000);
  assert.equal(new PercentDiscount(15).calculate({ subtotal: 33333, shippingFee: 0 }), 4999);
});

test('FixedDiscount không giảm quá tổng tiền', TODO, () => {
  assert.equal(new FixedDiscount(20000).calculate(cart), 20000);
  assert.equal(new FixedDiscount(500000).calculate(cart), 115000);
});

test('FreeShipping giảm đúng phí ship', TODO, () => {
  assert.equal(new FreeShipping().calculate(cart), 15000);
});

test('DiscountContext đổi strategy lúc chạy mà không sửa code giỏ hàng', TODO, () => {
  const context = new DiscountContext();
  assert.deepEqual(context.checkout(cart), {
    subtotal: 100000,
    shippingFee: 15000,
    discount: 0,
    total: 115000,
  });
  context.setStrategy(new PercentDiscount(10));
  assert.equal(context.checkout(cart).total, 105000);
  context.setStrategy(new FreeShipping());
  assert.equal(context.checkout(cart).total, 100000);
});

test('createDiscountStrategy chọn đúng strategy theo loại voucher', TODO, () => {
  assert.ok(createDiscountStrategy({ type: 'percent', value: 10 }) instanceof PercentDiscount);
  assert.ok(createDiscountStrategy({ type: 'fixed', value: 20000 }) instanceof FixedDiscount);
  assert.ok(createDiscountStrategy({ type: 'freeship' }) instanceof FreeShipping);
  assert.throws(() => createDiscountStrategy({ type: 'unknown' }));
});
