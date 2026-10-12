// Adapter — TV3 (Sprint 2). Test chấp nhận đã bật toàn bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PaymentGateway,
  CodAdapter,
  MomoAdapter,
  VnPayAdapter,
  createPaymentGateway,
} from '../src/patterns/structural/PaymentAdapter.js';

const order = { id: 'DH100', total: 47000 };
const queryOf = (url) => Object.fromEntries(new URL(url, 'http://localhost').searchParams);

test('mọi adapter đều là PaymentGateway và báo đúng phương thức', () => {
  for (const [Adapter, method] of [
    [CodAdapter, 'COD'],
    [MomoAdapter, 'MOMO'],
    [VnPayAdapter, 'VNPAY'],
  ]) {
    const gateway = new Adapter();
    assert.ok(gateway instanceof PaymentGateway);
    assert.equal(gateway.getMethod(), method);
  }
});

test('COD: chưa thu tiền, không chuyển trang', async () => {
  const result = await new CodAdapter().pay(order);
  assert.equal(result.method, 'COD');
  assert.equal(result.status, 'UNPAID');
  assert.equal(result.redirectUrl, null);
});

test('MoMo: thành công thì PENDING kèm link thanh toán', async () => {
  const result = await new MomoAdapter().pay(order);
  assert.equal(result.status, 'PENDING');
  const params = queryOf(result.redirectUrl);
  assert.equal(params.orderId, 'DH100');
  assert.equal(params.amount, '47000');
});

test('VNPay: adapter tự nhân 100 số tiền', async () => {
  const result = await new VnPayAdapter().pay(order);
  assert.equal(result.status, 'PENDING');
  assert.equal(queryOf(result.redirectUrl).vnp_Amount, '4700000');
});

test('lỗi từ cổng được dịch thành FAILED, pay() không ném lỗi', async () => {
  const momo = await new MomoAdapter().pay({ id: 'DH101', total: 500 });
  assert.equal(momo.status, 'FAILED');
  assert.match(momo.message, /Số tiền/);
  const vnpay = await new VnPayAdapter().pay({ id: 'DH102', total: 3000 });
  assert.equal(vnpay.status, 'FAILED');
  assert.ok(vnpay.message);
});

test('MoMo verify: dịch resultCode về { orderId, success, transactionId }', async () => {
  const momo = new MomoAdapter();
  const params = queryOf((await momo.pay(order)).redirectUrl);
  assert.deepEqual(await momo.verify({ ...params, resultCode: '0', transId: 'T1' }), {
    orderId: 'DH100',
    success: true,
    transactionId: 'T1',
  });
  assert.equal((await momo.verify({ ...params, resultCode: '1006' })).success, false);
  await assert.rejects(momo.verify({ ...params, amount: '1000', resultCode: '0' }), { status: 400 });
});

test('VNPay verify: dịch vnp_ResponseCode về cùng định dạng', async () => {
  const vnpay = new VnPayAdapter();
  const params = queryOf((await vnpay.pay(order)).redirectUrl);
  assert.deepEqual(
    await vnpay.verify({ ...params, vnp_ResponseCode: '00', vnp_TransactionNo: '123' }),
    { orderId: 'DH100', success: true, transactionId: '123' },
  );
  assert.equal((await vnpay.verify({ ...params, vnp_ResponseCode: '24' })).success, false);
  await assert.rejects(vnpay.verify({ ...params, vnp_Amount: '100', vnp_ResponseCode: '00' }), {
    status: 400,
  });
});

test('COD không có callback để verify', async () => {
  await assert.rejects(new CodAdapter().verify({}), { status: 400 });
});

test('createPaymentGateway chọn đúng adapter, phương thức lạ thì báo lỗi 400', () => {
  assert.ok(createPaymentGateway('COD') instanceof CodAdapter);
  assert.ok(createPaymentGateway('MOMO') instanceof MomoAdapter);
  assert.ok(createPaymentGateway('VNPAY') instanceof VnPayAdapter);
  assert.throws(() => createPaymentGateway('ZALOPAY'), { status: 400 });
});
