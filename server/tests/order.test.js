// Đơn hàng — TV5 (Sprint 1): orderRepository + GET/PATCH /api/orders/:id.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { orderRepository } from '../src/repositories/orderRepository.js';
import { Order } from '../src/patterns/behavioral/OrderState.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

test('seed sẵn 3 đơn mẫu đúng trạng thái', () => {
  assert.equal(orderRepository.findById('DH001').getStatus(), 'PENDING');
  assert.equal(orderRepository.findById('DH002').getStatus(), 'DELIVERING');
  assert.equal(orderRepository.findById('DH003').getStatus(), 'CANCELLED');
  assert.equal(orderRepository.findById('DH999'), null);
});

test('nextId không trùng và tiếp nối mã đã có', () => {
  const first = orderRepository.nextId();
  const second = orderRepository.nextId();
  assert.match(first, /^DH\d{3,}$/);
  assert.notEqual(first, second);
  assert.ok(Number(first.slice(2)) >= 4);
});

test('findAll: mới nhất trước, lọc theo trạng thái', () => {
  const order = orderRepository.save(new Order({ id: orderRepository.nextId(), customerName: 'Khách mới' }));
  const all = orderRepository.findAll();
  assert.equal(all[0].id, order.id);
  assert.ok(orderRepository.findAll({ status: 'CANCELLED' }).every((o) => o.getStatus() === 'CANCELLED'));
});

test('GET /orders/:id trả đơn kèm status và allowedActions', async () => {
  const { status, body } = await api.get('/orders/DH001');
  assert.equal(status, 200);
  assert.equal(body.id, 'DH001');
  assert.equal(body.status, 'PENDING');
  assert.deepEqual(body.allowedActions, ['next', 'cancel']);
  assert.ok(Array.isArray(body.items) && body.items.length > 0);
  assert.deepEqual(body.history, []);
});

test('GET /orders/:id không có đơn trả 404', async () => {
  const { status, body } = await api.get('/orders/DH999');
  assert.equal(status, 404);
  assert.match(body.error, /Không tìm thấy đơn/);
});

test('PATCH /orders/:id/status chuyển hợp lệ và ghi lịch sử', async () => {
  const { status, body } = await api.patch('/orders/DH001/status', { action: 'next' });
  assert.equal(status, 200);
  assert.equal(body.status, 'PREPARING');
  assert.deepEqual(body.history.map((h) => `${h.from}->${h.to}`), ['PENDING->PREPARING']);
  assert.equal((await api.get('/orders/DH001')).body.status, 'PREPARING');
});

test('PATCH hủy đơn đang giao bị 409, trạng thái giữ nguyên', async () => {
  const { status, body } = await api.patch('/orders/DH002/status', { action: 'cancel' });
  assert.equal(status, 409);
  assert.match(body.error, /Đang giao/);
  assert.equal((await api.get('/orders/DH002')).body.status, 'DELIVERING');
});

test('PATCH action lạ trả 400 kèm field, đơn không có trả 404', async () => {
  const bad = await api.patch('/orders/DH001/status', { action: 'delete' });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.field, 'action');
  assert.equal((await api.patch('/orders/DH999/status', { action: 'next' })).status, 404);
});
