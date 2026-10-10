// SDK thanh toán giả và tiện ích mật khẩu — đã cài sẵn, tất cả test phải PASS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeMomoSdk } from '../src/integrations/FakeMomoSdk.js';
import { FakeVnPaySdk } from '../src/integrations/FakeVnPaySdk.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

const queryOf = (url) => Object.fromEntries(new URL(url, 'http://localhost').searchParams);

test('MoMo giả: tạo giao dịch và kiểm tra chữ ký callback', async () => {
  const sdk = new FakeMomoSdk();
  const res = await sdk.createPayment({ partnerCode: 'MAYTEA', orderId: 'DH100', amount: 47000 });
  assert.equal(res.resultCode, 0);
  const params = queryOf(res.payUrl);
  assert.equal(params.gateway, 'momo');
  assert.equal(sdk.verifyCallback({ ...params, resultCode: '0' }).valid, true);
  assert.equal(sdk.verifyCallback({ ...params, amount: '1000', resultCode: '0' }).valid, false);
});

test('MoMo giả: trả mã lỗi thay vì ném lỗi', async () => {
  const sdk = new FakeMomoSdk();
  assert.equal((await sdk.createPayment({ partnerCode: 'SAI', orderId: 'x', amount: 47000 })).resultCode, 11);
  assert.equal((await sdk.createPayment({ partnerCode: 'MAYTEA', orderId: 'x', amount: 500 })).resultCode, 22);
});

test('VNPay giả: số tiền nhân 100, ném lỗi khi sai tham số', () => {
  const sdk = new FakeVnPaySdk();
  const url = sdk.buildPaymentUrl({ vnp_TxnRef: 'DH100', vnp_Amount: 4700000 });
  const params = queryOf(url);
  assert.equal(params.vnp_Amount, '4700000');
  const ok = sdk.verifyReturnUrl({ ...params, vnp_ResponseCode: '00' });
  assert.equal(ok.isValid, true);
  assert.equal(ok.isSuccess, true);
  assert.equal(sdk.verifyReturnUrl({ ...params, vnp_Amount: '100' }).isValid, false);
  assert.throws(() => sdk.buildPaymentUrl({ vnp_TxnRef: 'DH100', vnp_Amount: 47000.5 }));
  assert.throws(() => sdk.buildPaymentUrl({ vnp_TxnRef: 'DH100', vnp_Amount: 300000 }));
});

test('băm mật khẩu bằng scrypt và kiểm tra đúng/sai', () => {
  const stored = hashPassword('admin123');
  assert.match(stored, /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
  assert.equal(verifyPassword('admin123', stored), true);
  assert.equal(verifyPassword('sai-mat-khau', stored), false);
  assert.throws(() => hashPassword('123'));
});
