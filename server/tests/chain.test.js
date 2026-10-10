// Chain of Responsibility — TV5 (Sprint 2). Khi cài xong, XÓA `{ todo: 'TV5-S2' }` ở từng test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OrderValidationHandler,
  ValidationError,
  buildOrderValidationChain,
  currentHourInVietnam,
} from '../src/patterns/behavioral/OrderValidation.js';

const TODO = { todo: 'TV5-S2' };

const menuRepository = {
  getDrinkById: (id) => (id === 'ts-truyen-thong' ? { id, isActive: true } : null),
  getToppingById: (id) => (id === 'pudding' ? { id, price: 7000, isActive: true } : null),
};
const chainAt = (hour) => buildOrderValidationChain({ menuRepository, clock: () => hour });

const valid = () => ({
  customer: { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1' },
  items: [{ drinkId: 'ts-truyen-thong', toppingIds: ['pudding'], quantity: 2 }],
  paymentMethod: 'COD',
});

const expectField = (request, field, hour = 10) => {
  assert.throws(
    () => chainAt(hour).validate(request),
    (error) => error instanceof ValidationError && error.field === field && error.status === 400,
  );
};

test('setNext trả về handler kế tiếp để nối chuỗi', () => {
  const a = new OrderValidationHandler();
  const b = new OrderValidationHandler();
  const c = new OrderValidationHandler();
  assert.equal(a.setNext(b).setNext(c), c);
  assert.equal(a.validate({}), true);
});

test('giờ Việt Nam tính đúng múi giờ', () => {
  assert.equal(currentHourInVietnam(new Date('2026-10-26T01:30:00Z')), 8);
  assert.equal(currentHourInVietnam(new Date('2026-10-26T16:00:00Z')), 23);
});

test('đơn hợp lệ đi hết chuỗi', TODO, () => {
  assert.equal(chainAt(10).validate(valid()), true);
  assert.equal(chainAt(10).validate({ ...valid(), customer: { ...valid().customer, phone: '+84912345678' } }), true);
});

test('giỏ trống', TODO, () => {
  expectField({ ...valid(), items: [] }, 'items');
});

test('thông tin giao hàng', TODO, () => {
  const base = valid();
  expectField({ ...base, customer: { ...base.customer, name: ' A ' } }, 'customer.name');
  expectField({ ...base, customer: { ...base.customer, phone: '0123456789' } }, 'customer.phone');
  expectField({ ...base, customer: { ...base.customer, phone: '091234567' } }, 'customer.phone');
  expectField({ ...base, customer: { ...base.customer, address: 'Q1' } }, 'customer.address');
});

test('phương thức thanh toán', TODO, () => {
  expectField({ ...valid(), paymentMethod: 'BITCOIN' }, 'paymentMethod');
});

test('món, topping và số lượng', TODO, () => {
  const item = valid().items[0];
  expectField({ ...valid(), items: [{ ...item, drinkId: 'khong-co' }] }, 'items[0].drinkId');
  expectField({ ...valid(), items: [item, { ...item, toppingIds: ['khong-co'] }] }, 'items[1].toppingIds');
  expectField({ ...valid(), items: [{ ...item, quantity: 0 }] }, 'items[0].quantity');
  expectField({ ...valid(), items: [{ ...item, quantity: 21 }] }, 'items[0].quantity');
  expectField({ ...valid(), items: [{ ...item, quantity: 1.5 }] }, 'items[0].quantity');
});

test('giờ mở cửa 08:00 – trước 22:00', TODO, () => {
  assert.equal(chainAt(8).validate(valid()), true);
  assert.equal(chainAt(21).validate(valid()), true);
  expectField(valid(), 'store', 7);
  expectField(valid(), 'store', 22);
});

test('dừng ở lỗi ĐẦU TIÊN theo thứ tự chuỗi', TODO, () => {
  const request = { ...valid(), items: [], customer: { ...valid().customer, phone: 'sai' } };
  expectField(request, 'items', 23);
});
