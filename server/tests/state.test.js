// State — TV5. Test chấp nhận đã bật toàn bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order, InvalidTransitionError } from '../src/patterns/behavioral/OrderState.js';

const newOrder = () => new Order({ id: 'DH001', customerName: 'An', total: 47000 });

test('đơn mới ở trạng thái PENDING', () => {
  assert.equal(newOrder().getStatus(), 'PENDING');
});

test('đi hết vòng đời PENDING → PREPARING → DELIVERING → COMPLETED', () => {
  const order = newOrder();
  assert.equal(order.next().getStatus(), 'PREPARING');
  assert.equal(order.next().getStatus(), 'DELIVERING');
  assert.equal(order.next().getStatus(), 'COMPLETED');
});

test('được hủy khi PENDING hoặc PREPARING', () => {
  assert.equal(newOrder().cancel().getStatus(), 'CANCELLED');
  assert.equal(newOrder().next().cancel().getStatus(), 'CANCELLED');
});

test('không được hủy khi đang giao', () => {
  const order = newOrder().next().next();
  assert.throws(() => order.cancel(), InvalidTransitionError);
  assert.equal(order.getStatus(), 'DELIVERING');
});

test('không đi tiếp được khi đã hoàn thành hoặc đã hủy', () => {
  const done = newOrder().next().next().next();
  assert.throws(() => done.next(), InvalidTransitionError);
  const cancelled = newOrder().cancel();
  assert.throws(() => cancelled.next(), InvalidTransitionError);
});

test('allowedActions đúng theo trạng thái', () => {
  const order = newOrder();
  assert.deepEqual(order.getAllowedActions().sort(), ['cancel', 'next']);
  order.next().next();
  assert.deepEqual(order.getAllowedActions(), ['next']);
  order.next();
  assert.deepEqual(order.getAllowedActions(), []);
});

test('ghi lịch sử mỗi lần chuyển trạng thái', () => {
  const order = newOrder().next().cancel();
  assert.deepEqual(
    order.history.map((h) => `${h.from}->${h.to}`),
    ['PENDING->PREPARING', 'PREPARING->CANCELLED'],
  );
});
