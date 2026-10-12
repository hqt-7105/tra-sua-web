// Facade — TV1 (Sprint 2). Test chấp nhận đã bật toàn bộ.
// Mọi hệ thống con đều là đồ GIẢ nên test chạy được dù người khác chưa làm xong.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrderFacade } from '../src/patterns/structural/OrderFacade.js';

const request = (overrides = {}) => ({
  customer: { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1', note: '' },
  items: [
    { drinkId: 'ts-truyen-thong', size: 'M', sugar: 100, ice: 100, toppingIds: [], quantity: 1 },
    { drinkId: 'ttc-dao', size: 'L', sugar: 50, ice: 50, toppingIds: ['pudding'], quantity: 1 },
  ],
  paymentMethod: 'COD',
  ...overrides,
});

function setup({ failValidation = false, paymentStatus } = {}) {
  const calls = [];
  const saved = [];
  const events = [];
  const deps = {
    validator: {
      validate() {
        calls.push('validate');
        if (failValidation) {
          const error = new Error('Số điện thoại không hợp lệ');
          error.status = 400;
          error.field = 'customer.phone';
          throw error;
        }
        return true;
      },
    },
    createItem(line) {
      calls.push('createItem');
      const totalPrice = 40000 * line.quantity;
      return { totalPrice, toJSON: () => ({ drinkId: line.drinkId, totalPrice }) };
    },
    voucherService: {
      apply({ code, subtotal, shippingFee }) {
        calls.push('voucher');
        return { code, type: 'fixed', discount: 10000, total: subtotal + shippingFee - 10000 };
      },
    },
    paymentGatewayFactory(method) {
      return {
        getMethod: () => method,
        async pay(order) {
          calls.push('pay');
          if (paymentStatus === 'FAILED') {
            return { method, status: 'FAILED', redirectUrl: null, message: 'Cổng từ chối giao dịch' };
          }
          return method === 'COD'
            ? { method, status: 'UNPAID', redirectUrl: null, message: '' }
            : { method, status: 'PENDING', redirectUrl: `/payment/mock?orderId=${order.id}`, message: '' };
        },
      };
    },
    orderRepository: {
      nextId: () => 'DH100',
      save(order) {
        calls.push('save');
        saved.push(order);
        return order;
      },
    },
    orderEvents: {
      notify(event) {
        calls.push('notify');
        events.push(event);
      },
    },
    config: { shippingFee: 15000 },
  };
  return { facade: new OrderFacade(deps), calls, saved, events };
}

test('đặt đơn COD: tính tiền, lưu đơn, phát sự kiện ORDER_CREATED', async () => {
  const { facade, saved, events } = setup();
  const { order, payment } = await facade.placeOrder(request());

  assert.equal(order.id, 'DH100');
  assert.equal(order.status, 'PENDING');
  assert.equal(order.customerName, 'Nguyễn An');
  assert.equal(order.items.length, 2);
  assert.equal(order.subtotal, 80000);
  assert.equal(order.shippingFee, 15000);
  assert.equal(order.discount, 0);
  assert.equal(order.total, 95000);
  assert.equal(order.paymentMethod, 'COD');
  assert.equal(order.paymentStatus, 'UNPAID');
  assert.equal(payment.redirectUrl, null);

  assert.equal(saved.length, 1);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'ORDER_CREATED');
  assert.equal(events[0].orderId, 'DH100');
});

test('có mã giảm giá thì trừ tiền và lưu mã', async () => {
  const { facade } = setup();
  const { order } = await facade.placeOrder(request({ voucherCode: 'GIAM10K' }));
  assert.equal(order.discount, 10000);
  assert.equal(order.total, 85000);
  assert.equal(order.voucherCode, 'GIAM10K');
});

test('thanh toán online trả về link chuyển sang cổng', async () => {
  const { facade } = setup();
  const { order, payment } = await facade.placeOrder(request({ paymentMethod: 'MOMO' }));
  assert.equal(order.paymentStatus, 'PENDING');
  assert.equal(payment.redirectUrl, '/payment/mock?orderId=DH100');
});

test('gọi các hệ thống con đúng thứ tự', async () => {
  const { facade, calls } = setup();
  await facade.placeOrder(request({ voucherCode: 'GIAM10K' }));
  assert.deepEqual(calls, ['validate', 'createItem', 'createItem', 'voucher', 'pay', 'save', 'notify']);
});

test('dữ liệu không hợp lệ thì dừng ngay, không thanh toán, không lưu', async () => {
  const { facade, calls } = setup({ failValidation: true });
  await assert.rejects(facade.placeOrder(request()), { status: 400, field: 'customer.phone' });
  assert.deepEqual(calls, ['validate']);
});

test('thanh toán thất bại thì báo lỗi 402 và không lưu đơn', async () => {
  const { facade, saved, events } = setup({ paymentStatus: 'FAILED' });
  await assert.rejects(facade.placeOrder(request({ paymentMethod: 'VNPAY' })), {
    status: 402,
    message: 'Cổng từ chối giao dịch',
  });
  assert.equal(saved.length, 0);
  assert.equal(events.length, 0);
});
