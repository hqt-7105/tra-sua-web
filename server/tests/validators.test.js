// Validators dùng chung — TV3 (B3): kiểm tra thông tin giao hàng theo BR11.
// Mỗi test chạy trên CẢ bản server và bản trình duyệt để hai bản luôn giữ khớp quy tắc.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as serverValidators from '../src/utils/validators.js';
import * as clientValidators from '../../client/src/utils/validators.js';

const versions = [
  ['server', serverValidators],
  ['client', clientValidators],
];

/** Chạy cùng một test cho cả hai bản. */
const both = (name, fn) => {
  for (const [label, v] of versions) test(`[${label}] ${name}`, () => fn(v));
};

const assertInvalid = (result, field, pattern) => {
  assert.equal(result.ok, false, JSON.stringify(result));
  assert.equal(result.field, field);
  assert.equal(typeof result.message, 'string');
  if (pattern) assert.match(result.message, pattern);
};

both('họ tên hợp lệ, bỏ khoảng trắng hai đầu', ({ validateName }) => {
  assert.deepEqual(validateName('Nguyễn An'), { ok: true, value: 'Nguyễn An' });
  assert.deepEqual(validateName('   Nguyễn An  '), { ok: true, value: 'Nguyễn An' });
});

both('họ tên: biên 2 ký tự, tính sau khi bỏ khoảng trắng', ({ validateName }) => {
  assert.equal(validateName('An').ok, true);
  assertInvalid(validateName(' A '), 'customer.name', /ít nhất 2 ký tự/);
  assertInvalid(validateName('   '), 'customer.name', /nhập họ tên/);
});

both('họ tên thiếu hoặc sai kiểu', ({ validateName }) => {
  assertInvalid(validateName(undefined), 'customer.name');
  assertInvalid(validateName(null), 'customer.name');
  assertInvalid(validateName(12), 'customer.name');
});

both('họ tên gõ dạng tổ hợp (NFD) được đếm theo chữ thật', ({ validateName }) => {
  assertInvalid(validateName('Â'), 'customer.name'); // "Â" gõ thành 2 mã → vẫn chỉ 1 chữ
  assert.deepEqual(validateName('Ân'), { ok: true, value: 'Ân' });
});

both('SĐT hợp lệ với cả 5 đầu số 03, 05, 07, 08, 09', ({ validatePhone }) => {
  for (const phone of ['0312345678', '0512345678', '0712345678', '0812345678', '0912345678']) {
    assert.deepEqual(validatePhone(phone), { ok: true, value: phone });
  }
});

both('SĐT +84 được chuẩn hóa về 0', ({ validatePhone }) => {
  assert.deepEqual(validatePhone('+84912345678'), { ok: true, value: '0912345678' });
  assert.deepEqual(validatePhone(' +84387654321 '), { ok: true, value: '0387654321' });
});

both('SĐT sai đầu số', ({ validatePhone }) => {
  for (const phone of ['0123456789', '0212345678', '0412345678', '0612345678', '+84112345678']) {
    assertInvalid(validatePhone(phone), 'customer.phone', /03, 05, 07, 08 hoặc 09/);
  }
});

both('SĐT sai độ dài (9 và 11 số)', ({ validatePhone }) => {
  assertInvalid(validatePhone('091234567'), 'customer.phone');
  assertInvalid(validatePhone('09123456789'), 'customer.phone');
  assertInvalid(validatePhone('+849123456789'), 'customer.phone');
});

both('SĐT: khoảng trắng hai đầu được bỏ, ký tự lạ ở giữa thì sai (đúng mẫu BR11)', ({ validatePhone }) => {
  assert.deepEqual(validatePhone('  0912345678 '), { ok: true, value: '0912345678' });
  assertInvalid(validatePhone('0912 345 678'), 'customer.phone');
  assertInvalid(validatePhone('0912.345.678'), 'customer.phone');
  assertInvalid(validatePhone('09123abcde'), 'customer.phone');
  assertInvalid(validatePhone('84912345678'), 'customer.phone');
  assertInvalid(validatePhone('+840912345678'), 'customer.phone');
});

both('SĐT thiếu hoặc sai kiểu', ({ validatePhone }) => {
  assertInvalid(validatePhone(''), 'customer.phone', /nhập số điện thoại/);
  assertInvalid(validatePhone(undefined), 'customer.phone', /nhập số điện thoại/);
  assertInvalid(validatePhone(912345678), 'customer.phone');
});

both('địa chỉ hợp lệ, bỏ khoảng trắng hai đầu; biên đúng 10 ký tự', ({ validateAddress }) => {
  assert.deepEqual(validateAddress('  12 Nguyễn Huệ, Quận 1 '), { ok: true, value: '12 Nguyễn Huệ, Quận 1' });
  assert.deepEqual(validateAddress('  1234567890  '), { ok: true, value: '1234567890' });
  assert.equal(validateAddress('12 Lê Lợi Q1').ok, true); // 12 ký tự
});

both('địa chỉ quá ngắn hoặc thiếu', ({ validateAddress }) => {
  assertInvalid(validateAddress('12 Lê Lợi'), 'customer.address', /ít nhất 10 ký tự/); // 9 ký tự
  assertInvalid(validateAddress('123456789'), 'customer.address', /ít nhất 10 ký tự/);
  assertInvalid(validateAddress('   Q1      '), 'customer.address');
  assertInvalid(validateAddress(''), 'customer.address', /nhập địa chỉ/);
  assertInvalid(validateAddress(null), 'customer.address');
});

both('ghi chú không bắt buộc, bỏ khoảng trắng hai đầu', ({ validateNote }) => {
  assert.deepEqual(validateNote(undefined), { ok: true, value: '' });
  assert.deepEqual(validateNote(null), { ok: true, value: '' });
  assert.deepEqual(validateNote(''), { ok: true, value: '' });
  assert.deepEqual(validateNote('  Gọi trước khi giao '), { ok: true, value: 'Gọi trước khi giao' });
});

both('ghi chú tối đa 200 ký tự, sai kiểu thì báo lỗi', ({ validateNote, MAX_NOTE_LENGTH }) => {
  assert.equal(MAX_NOTE_LENGTH, 200);
  assert.equal(validateNote('a'.repeat(200)).ok, true);
  assert.equal(validateNote(`  ${'a'.repeat(200)}  `).ok, true);
  assertInvalid(validateNote('a'.repeat(201)), 'customer.note', /tối đa 200 ký tự/);
  assertInvalid(validateNote(42), 'customer.note');
});

both('đổi được tên field cho form dùng tên ô khác', ({ validateName, validatePhone, validateAddress, validateNote }) => {
  assert.equal(validateName('', 'name').field, 'name');
  assert.equal(validatePhone('sai', 'phone').field, 'phone');
  assert.equal(validateAddress('ngắn', 'address').field, 'address');
  assert.equal(validateNote(1, 'note').field, 'note');
});

test('bản server và bản trình duyệt cho cùng kết quả trên mọi dữ liệu mẫu', () => {
  const samples = [undefined, null, '', '  ', 'A', 'An', ' Nguyễn An ', '0912345678', '+84912345678', '0123456789',
    '0912 345 678', '12 Nguyễn Huệ, Quận 1', '123456789', 'a'.repeat(201), 42];
  for (const name of ['validateName', 'validatePhone', 'validateAddress', 'validateNote']) {
    for (const sample of samples) {
      assert.deepEqual(clientValidators[name](sample), serverValidators[name](sample), `${name}(${JSON.stringify(sample)})`);
    }
  }
  for (const constant of ['MIN_NAME_LENGTH', 'MIN_ADDRESS_LENGTH', 'MAX_NOTE_LENGTH']) {
    assert.equal(clientValidators[constant], serverValidators[constant], constant);
  }
  assert.equal(String(clientValidators.PHONE_PATTERN), String(serverValidators.PHONE_PATTERN));
});
