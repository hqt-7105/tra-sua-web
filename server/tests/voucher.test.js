// Mã giảm giá — TV4 (Sprint 1): voucherService + POST /api/vouchers/validate.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { voucherService } from '../src/services/voucherService.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

const validate = (body) => api.post('/vouchers/validate', body);

test('MAY10 cho đơn 100.000đ giảm 10.000đ (đúng ví dụ trong API.md)', async () => {
  const { status, body } = await validate({ code: 'MAY10', subtotal: 100000, shippingFee: 15000 });
  assert.equal(status, 200);
  assert.deepEqual(body, {
    code: 'MAY10',
    type: 'percent',
    discount: 10000,
    total: 105000,
    message: 'Giảm 10% (tối đa 20.000đ)',
  });
});

test('mã không phân biệt hoa thường và khoảng trắng hai đầu', async () => {
  const { status, body } = await validate({ code: '  may10 ', subtotal: 100000, shippingFee: 15000 });
  assert.equal(status, 200);
  assert.equal(body.code, 'MAY10');
});

test('mã hết hạn trả 400 kèm thông báo rõ ràng', async () => {
  const { status, body } = await validate({ code: 'HETHAN', subtotal: 100000, shippingFee: 15000 });
  assert.equal(status, 400);
  assert.match(body.error, /hết hạn/);
});

test('đơn chưa đủ giá trị tối thiểu trả 400 và cho biết còn thiếu bao nhiêu', async () => {
  const { status, body } = await validate({ code: 'GIAM20K', subtotal: 50000, shippingFee: 15000 });
  assert.equal(status, 400);
  assert.match(body.error, /80\.000đ/);
  assert.match(body.error, /30\.000đ/);
});

test('mã hết lượt trả 400', async () => {
  const { status, body } = await validate({ code: 'HETLUOT', subtotal: 100000, shippingFee: 15000 });
  assert.equal(status, 400);
  assert.match(body.error, /hết lượt/);
});

test('mã không tồn tại trả 404', async () => {
  const { status, body } = await validate({ code: 'KHONGCO', subtotal: 100000, shippingFee: 15000 });
  assert.equal(status, 404);
  assert.match(body.error, /không tồn tại/);
});

test('FREESHIP giảm đúng phí ship; thiếu shippingFee thì dùng phí ship cấu hình', async () => {
  const { body } = await validate({ code: 'FREESHIP', subtotal: 120000 });
  assert.equal(body.discount, 15000);
  assert.equal(body.total, 120000);
});

test('dữ liệu đầu vào sai trả 400 kèm field', async () => {
  const empty = await validate({ code: '', subtotal: 100000 });
  assert.equal(empty.status, 400);
  assert.equal(empty.body.field, 'code');
  const badSubtotal = await validate({ code: 'MAY10', subtotal: '100000' });
  assert.equal(badSubtotal.status, 400);
  assert.equal(badSubtotal.body.field, 'subtotal');
});

test('GET /vouchers chỉ liệt kê mã còn dùng được', async () => {
  const { status, body } = await api.get('/vouchers');
  assert.equal(status, 200);
  const codes = body.map((v) => v.code);
  assert.ok(codes.includes('MAY10'));
  assert.ok(!codes.includes('HETHAN'));
  assert.ok(!codes.includes('HETLUOT'));
});

test('voucherService.apply kiểm tra hạn theo thời điểm truyền vào', () => {
  const now = new Date('2027-01-01T00:00:00+07:00');
  assert.throws(
    () => voucherService.apply({ code: 'MAY10', subtotal: 100000, shippingFee: 15000, now }),
    { status: 400 },
  );
});
