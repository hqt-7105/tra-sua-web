// Singleton CartStore — TV2. Test chấp nhận đã bật toàn bộ.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CartStore } from '../src/store/cartStore.js';

const item = (key, unitPrice = 40000, quantity = 1) => ({
  key,
  drinkId: 'ts-truyen-thong',
  description: 'Trà sữa truyền thống',
  unitPrice,
  quantity,
});

beforeEach(() => {
  try {
    CartStore.getInstance().clear();
  } catch {
    /* chưa cài */
  }
});

test('getInstance luôn trả cùng một đối tượng', () => {
  assert.equal(CartStore.getInstance(), CartStore.getInstance());
});

test('không cho tạo trực tiếp bằng new', () => {
  CartStore.getInstance();
  assert.throws(() => new CartStore());
});

test('thêm cùng key thì cộng dồn số lượng', () => {
  const cart = CartStore.getInstance();
  cart.addItem(item('a', 40000, 1));
  cart.addItem(item('a', 40000, 2));
  cart.addItem(item('b', 50000, 1));
  assert.equal(cart.getItems().length, 2);
  assert.equal(cart.getCount(), 4);
  assert.equal(cart.getSubtotal(), 170000);
});

test('updateQuantity về 0 thì xóa món', () => {
  const cart = CartStore.getInstance();
  cart.addItem(item('a'));
  cart.updateQuantity('a', 0);
  assert.equal(cart.getItems().length, 0);
});

test('getItems trả bản sao', () => {
  const cart = CartStore.getInstance();
  cart.addItem(item('a'));
  cart.getItems().pop();
  assert.equal(cart.getItems().length, 1);
});

test('subscribe nhận thông báo, hủy đăng ký thì thôi nhận', () => {
  const cart = CartStore.getInstance();
  let calls = 0;
  const unsubscribe = cart.subscribe(() => calls++);
  cart.addItem(item('a'));
  unsubscribe();
  cart.addItem(item('b'));
  assert.equal(calls, 1);
});
