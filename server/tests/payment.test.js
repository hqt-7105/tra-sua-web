// Thanh toán — TV3 (Sprint 2): GET /api/payments/methods, POST /api/payments/confirm (Client của Adapter).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { orderRepository } from '../src/repositories/orderRepository.js';
import { Order } from '../src/patterns/behavioral/OrderState.js';
import { MomoAdapter, VnPayAdapter } from '../src/patterns/structural/PaymentAdapter.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

const queryOf = (url) => Object.fromEntries(new URL(url, 'http://localhost').searchParams);

/** Tạo đơn online đang chờ cổng báo về, trả kèm query cổng sẽ gửi lại trang /payment/mock. */
async function onlineOrder(Adapter, method) {
  const order = orderRepository.save(
    new Order({ id: orderRepository.nextId(), total: 47000, paymentMethod: method, paymentStatus: 'PENDING' }),
  );
  const payment = await new Adapter().pay(order);
  return { order, params: queryOf(payment.redirectUrl) };
}

test('GET /payments/methods trả 3 phương thức kèm tên', async () => {
  const { status, body } = await api.get('/payments/methods');
  assert.equal(status, 200);
  assert.deepEqual(body, [
    { id: 'COD', name: 'Thanh toán khi nhận hàng' },
    { id: 'MOMO', name: 'Ví MoMo' },
    { id: 'VNPAY', name: 'VNPay' },
  ]);
});

test('MoMo thanh toán thành công → PAID, đơn vẫn chờ xác nhận', async () => {
  const { order, params } = await onlineOrder(MomoAdapter, 'MOMO');
  const { status, body } = await api.post('/payments/confirm', {
    gateway: 'momo',
    params: { ...params, resultCode: '0', transId: 'MM1' },
  });
  assert.equal(status, 200);
  assert.deepEqual(body, { orderId: order.id, status: 'PENDING', paymentStatus: 'PAID' });
});

test('khách hủy giao dịch VNPay → FAILED và đơn tự hủy (BR17)', async () => {
  const { order, params } = await onlineOrder(VnPayAdapter, 'VNPAY');
  const { status, body } = await api.post('/payments/confirm', {
    gateway: 'vnpay',
    params: { ...params, vnp_ResponseCode: '24' },
  });
  assert.equal(status, 200);
  assert.deepEqual(body, { orderId: order.id, status: 'CANCELLED', paymentStatus: 'FAILED' });
  assert.equal(orderRepository.findById(order.id).getStatus(), 'CANCELLED');
});

test('chữ ký sai → 400, đơn không đổi', async () => {
  const { order, params } = await onlineOrder(VnPayAdapter, 'VNPAY');
  const { status, body } = await api.post('/payments/confirm', {
    gateway: 'vnpay',
    params: { ...params, vnp_Amount: '100', vnp_ResponseCode: '00' },
  });
  assert.equal(status, 400);
  assert.match(body.error, /Chữ ký/);
  assert.equal(orderRepository.findById(order.id).paymentStatus, 'PENDING');
});

test('cổng lạ hoặc thiếu cổng → 400; đơn không có → 404', async () => {
  assert.equal((await api.post('/payments/confirm', { gateway: 'zalopay', params: {} })).status, 400);
  assert.equal((await api.post('/payments/confirm', { params: {} })).body.field, 'gateway');
  const ghost = await new MomoAdapter().pay({ id: 'DH999', total: 47000 });
  const { status } = await api.post('/payments/confirm', {
    gateway: 'momo',
    params: { ...queryOf(ghost.redirectUrl), resultCode: '0' },
  });
  assert.equal(status, 404);
});

test('đơn đã thanh toán thì báo hủy sau đó không làm đổi trạng thái', async () => {
  const { order, params } = await onlineOrder(MomoAdapter, 'MOMO');
  await api.post('/payments/confirm', { gateway: 'momo', params: { ...params, resultCode: '0' } });
  const { body } = await api.post('/payments/confirm', { gateway: 'momo', params: { ...params, resultCode: '1006' } });
  assert.deepEqual(body, { orderId: order.id, status: 'PENDING', paymentStatus: 'PAID' });
});

test('callback của cổng khác phương thức đơn → 400', async () => {
  const { params } = await onlineOrder(MomoAdapter, 'VNPAY');
  const { status } = await api.post('/payments/confirm', { gateway: 'momo', params: { ...params, resultCode: '0' } });
  assert.equal(status, 400);
});
