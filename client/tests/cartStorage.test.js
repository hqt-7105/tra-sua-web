// Singleton CartStore — TV2: lưu/đọc localStorage (BR05: giỏ còn nguyên khi tải lại trang).
// File test riêng vì cần giả lập localStorage TRƯỚC khi module tạo instance.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map([
  [
    'may-cart',
    JSON.stringify({
      items: [
        { key: 'a', drinkId: 'ts-truyen-thong', description: 'Trà sữa', unitPrice: 40000, quantity: 2 },
        { key: 'hong', unitPrice: -1, quantity: 1 },
      ],
      voucherCode: 'MAY10',
    }),
  ],
]);
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

const { CartStore, MAX_QUANTITY } = await import('../src/store/cartStore.js');
const saved = () => JSON.parse(store.get('may-cart'));

test('đọc lại giỏ đã lưu, bỏ dòng hỏng', () => {
  const cart = CartStore.getInstance();
  assert.equal(cart.getCount(), 2);
  assert.equal(cart.getSubtotal(), 80000);
  assert.equal(cart.getVoucherCode(), 'MAY10');
});

test('mỗi thay đổi đều được lưu vào localStorage', () => {
  const cart = CartStore.getInstance();
  cart.addItem({ key: 'b', drinkId: 'ttc-dao', unitPrice: 39000, quantity: 1 });
  assert.deepEqual(saved().items.map((i) => i.key), ['a', 'b']);
  cart.setVoucherCode('freeship');
  assert.equal(saved().voucherCode, 'FREESHIP');
});

test('số lượng mỗi dòng không vượt quá giới hạn', () => {
  const cart = CartStore.getInstance();
  cart.updateQuantity('a', 99);
  assert.equal(cart.getItems().find((i) => i.key === 'a').quantity, MAX_QUANTITY);
});

test('snapshot chỉ đổi khi giỏ đổi (dùng cho useSyncExternalStore)', () => {
  const cart = CartStore.getInstance();
  const before = cart.getSnapshot();
  assert.equal(cart.getSnapshot(), before);
  assert.ok(Object.isFrozen(before.items));
  cart.removeItem('b');
  assert.notEqual(cart.getSnapshot(), before);
});

test('clear xóa cả món và mã giảm giá đã áp', () => {
  const cart = CartStore.getInstance();
  cart.clear();
  assert.equal(cart.getCount(), 0);
  assert.equal(cart.getVoucherCode(), null);
  assert.deepEqual(saved(), { items: [], voucherCode: null });
});
