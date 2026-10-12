// Quản lý đơn admin — TV5 (Sprint 2): GET /api/admin/orders, PATCH /api/admin/orders/:id/status.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { orderLog } from '../src/events.js';

let api;
let staff;
before(async () => {
  api = await startTestServer();
  staff = await api.loginAs('staff');
});
after(() => api.close());

test('chưa đăng nhập thì 401', async () => {
  assert.equal((await api.get('/admin/orders')).status, 401);
  assert.equal((await api.patch('/admin/orders/DH001/status', { action: 'next' })).status, 401);
});

test('danh sách đơn mới nhất trước, cùng dạng GET /orders/:id', async () => {
  const { status, body } = await api.get('/admin/orders', staff);
  assert.equal(status, 200);
  assert.deepEqual(body.map((o) => o.id).slice(0, 3), ['DH003', 'DH002', 'DH001']);
  assert.ok(body.every((o) => o.status && Array.isArray(o.allowedActions) && Array.isArray(o.history)));
});

test('lọc theo trạng thái; trạng thái lạ trả 400 kèm field', async () => {
  const delivering = await api.get('/admin/orders?status=DELIVERING', staff);
  assert.deepEqual(delivering.body.map((o) => o.id), ['DH002']);
  const bad = await api.get('/admin/orders?status=DONE', staff);
  assert.equal(bad.status, 400);
  assert.equal(bad.body.field, 'status');
});

test('nhân viên xác nhận đơn: PENDING → PREPARING, ghi lịch sử, phát STATUS_CHANGED', async () => {
  const { status, body } = await api.patch('/admin/orders/DH001/status', { action: 'next' }, staff);
  assert.equal(status, 200);
  assert.equal(body.status, 'PREPARING');
  assert.deepEqual(body.history.map((h) => `${h.from}->${h.to}`), ['PENDING->PREPARING']);
  const event = orderLog.getLogs('DH001').at(-1);
  assert.equal(event.type, 'STATUS_CHANGED');
  assert.equal(event.from, 'PENDING');
  assert.equal(event.to, 'PREPARING');
  assert.equal((await api.get('/orders/DH001')).body.status, 'PREPARING');
});

test('hủy đơn đang giao bị 409, trạng thái giữ nguyên (BR15)', async () => {
  const { status, body } = await api.patch('/admin/orders/DH002/status', { action: 'cancel' }, staff);
  assert.equal(status, 409);
  assert.match(body.error, /Đang giao/);
  assert.equal((await api.get('/orders/DH002')).body.status, 'DELIVERING');
});

test('action lạ 400 kèm field, đơn không có 404, đơn đã hủy không đổi được', async () => {
  const bad = await api.patch('/admin/orders/DH001/status', { action: 'delete' }, staff);
  assert.equal(bad.status, 400);
  assert.equal(bad.body.field, 'action');
  assert.equal((await api.patch('/admin/orders/DH999/status', { action: 'next' }, staff)).status, 404);
  assert.equal((await api.patch('/admin/orders/DH003/status', { action: 'next' }, staff)).status, 409);
});
