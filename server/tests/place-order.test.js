// Đặt hàng qua Facade — TV1 (Sprint 2): POST /api/orders với hệ thống con thật.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { orderRepository } from '../src/repositories/orderRepository.js';
import { orderLog } from '../src/events.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());
// Giờ giả lập: test không phụ thuộc lúc chạy (BR14 có test riêng ở dưới).
beforeEach(() => {
  process.env.FAKE_HOUR = '10';
});

const request = (overrides = {}) => ({
  customer: { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1', note: 'Gọi trước khi giao' },
  items: [
    { drinkId: 'ts-truyen-thong', size: 'L', sugar: 50, ice: 70, toppingIds: ['tran-chau-den'], quantity: 2, note: '' },
  ],
  paymentMethod: 'COD',
  ...overrides,
});

const orderCount = () => orderRepository.findAll().length;

test('đặt COD thành công: 201, đơn PENDING/UNPAID, tiền do server tính', async () => {
  const { status, body } = await api.post('/orders', request());
  assert.equal(status, 201);
  const { order, payment } = body;
  assert.match(order.id, /^DH\d{3,}$/);
  assert.equal(order.status, 'PENDING');
  assert.equal(order.paymentStatus, 'UNPAID');
  assert.deepEqual(order.allowedActions, ['next', 'cancel']);
  assert.equal(order.items[0].unitPrice, 46000); // 35.000 + size L 6.000 + trân châu 5.000 (BR02)
  assert.equal(order.subtotal, 92000);
  assert.equal(order.shippingFee, 15000);
  assert.equal(order.total, 107000);
  assert.equal(payment.method, 'COD');
  assert.equal(payment.redirectUrl, null);

  const saved = await api.get(`/orders/${order.id}`);
  assert.equal(saved.status, 200);
  assert.equal(saved.body.customerName, 'Nguyễn An');
  assert.ok(orderLog.getLogs(order.id).some((e) => e.type === 'ORDER_CREATED'));
});

test('áp MAY10 đúng ví dụ API.md: giảm 9.200đ, tổng 97.800đ', async () => {
  const { status, body } = await api.post('/orders', request({ voucherCode: 'may10' }));
  assert.equal(status, 201);
  assert.equal(body.order.discount, 9200);
  assert.equal(body.order.total, 97800);
  assert.equal(body.order.voucherCode, 'MAY10');
});

test('giá gửi từ trình duyệt bị bỏ qua (BR02)', async () => {
  const items = [{ drinkId: 'ts-truyen-thong', quantity: 1, unitPrice: 1, totalPrice: 1 }];
  const { body } = await api.post('/orders', request({ items, subtotal: 1, total: 1 }));
  assert.equal(body.order.subtotal, 35000);
  assert.equal(body.order.total, 50000);
});

test('sai số điện thoại → 400 kèm field, không tạo đơn', async () => {
  const before = orderCount();
  const { status, body } = await api.post(
    '/orders',
    request({ customer: { ...request().customer, phone: '0123456789' } }),
  );
  assert.equal(status, 400);
  assert.equal(body.field, 'customer.phone');
  assert.match(body.error, /Số điện thoại/);
  assert.equal(orderCount(), before);
});

test('mã giảm giá không tồn tại → 404, không tạo đơn', async () => {
  const before = orderCount();
  const { status, body } = await api.post('/orders', request({ voucherCode: 'KHONGCO' }));
  assert.equal(status, 404);
  assert.match(body.error, /không tồn tại/);
  assert.equal(orderCount(), before);
});

test('mã hết hạn → 400, không tạo đơn', async () => {
  const before = orderCount();
  const { status } = await api.post('/orders', request({ voucherCode: 'HETHAN' }));
  assert.equal(status, 400);
  assert.equal(orderCount(), before);
});

test('đặt MoMo → PENDING kèm link cổng giả; xác nhận thành công thì PAID', async () => {
  const { status, body } = await api.post('/orders', request({ paymentMethod: 'MOMO' }));
  assert.equal(status, 201);
  assert.equal(body.order.paymentStatus, 'PENDING');
  assert.match(body.payment.redirectUrl, /^\/payment\/mock\?gateway=momo&orderId=DH\d+/);

  const params = Object.fromEntries(new URL(body.payment.redirectUrl, 'http://x').searchParams);
  const confirmed = await api.post('/payments/confirm', { gateway: 'momo', params: { ...params, resultCode: '0' } });
  assert.deepEqual(confirmed.body, { orderId: body.order.id, status: 'PENDING', paymentStatus: 'PAID' });
});

test('đặt VNPay → hủy giao dịch thì đơn CANCELLED (BR17)', async () => {
  const { body } = await api.post('/orders', request({ paymentMethod: 'VNPAY' }));
  const params = Object.fromEntries(new URL(body.payment.redirectUrl, 'http://x').searchParams);
  assert.equal(params.vnp_Amount, String(body.order.total * 100));
  const cancelled = await api.post('/payments/confirm', {
    gateway: 'vnpay',
    params: { ...params, vnp_ResponseCode: '24' },
  });
  assert.equal(cancelled.body.status, 'CANCELLED');
  assert.equal(cancelled.body.paymentStatus, 'FAILED');
});

test('cổng từ chối tạo giao dịch → 402, không tạo đơn (BR18)', async () => {
  // MoMo chỉ nhận tối đa 50.000.000đ: 45 dòng × 20 ly × 62.000đ ≈ 55,8 triệu
  const items = Array.from({ length: 45 }, () => ({ drinkId: 'dx-cookie', toppingIds: ['kem-cheese'], quantity: 20 }));
  const before = orderCount();
  const { status, body } = await api.post('/orders', request({ items, paymentMethod: 'MOMO' }));
  assert.equal(status, 402);
  assert.match(body.error, /MoMo từ chối/);
  assert.equal(orderCount(), before);
});

test('ngoài giờ mở cửa (giờ giả lập 23:00) → 400 field store (BR14)', async () => {
  process.env.FAKE_HOUR = '23';
  const { status, body } = await api.post('/orders', request());
  assert.equal(status, 400);
  assert.equal(body.field, 'store');
  assert.match(body.error, /đóng cửa/);
});

test('giỏ trống và món ngừng bán bị chặn ở chuỗi kiểm tra', async () => {
  assert.equal((await api.post('/orders', request({ items: [] }))).body.field, 'items');
  const { status, body } = await api.post('/orders', request({ items: [{ drinkId: 'khong-co', quantity: 1 }] }));
  assert.equal(status, 400);
  assert.equal(body.field, 'items[0].drinkId');
  assert.equal((await api.post('/orders')).status, 400);
});
