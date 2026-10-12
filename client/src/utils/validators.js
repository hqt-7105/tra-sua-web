/**
 * Kiểm tra thông tin giao hàng phía trình duyệt — PHỤ TRÁCH: TV3 (B3).
 * BẢN SAO của server/src/utils/validators.js: PHẢI GIỮ KHỚP quy tắc với bản server.
 * Sửa một bên thì sửa cả bên kia; server/tests/validators.test.js chạy cùng bộ test
 * trên cả hai bản và so kết quả nên lệch là test đỏ ngay.
 * Server vẫn kiểm tra lại (không tin dữ liệu trình duyệt); bản này để báo lỗi sớm dưới ô nhập.
 *
 * Cách dùng (form Checkout, TV1):
 *   import { validatePhone } from '../utils/validators.js';
 *   const result = validatePhone(form.phone);
 *   if (!result.ok) setErrors({ [result.field]: result.message }); // field: 'customer.phone'
 *
 * Mỗi hàm trả { ok: true, value } hoặc { ok: false, field, message } (tiếng Việt).
 * field mặc định 'customer.name' | 'customer.phone' | 'customer.address' | 'customer.note',
 * khớp field lỗi API trả về; truyền tham số thứ hai nếu form dùng tên ô khác.
 */

export const MIN_NAME_LENGTH = 2;
export const MIN_ADDRESS_LENGTH = 10;
export const MAX_NOTE_LENGTH = 200;
/** BR11: số di động Việt Nam, 0 hoặc +84, rồi đầu 3/5/7/8/9 và 8 chữ số. */
export const PHONE_PATTERN = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

/** Chuỗi đã chuẩn hóa Unicode (NFC) và bỏ khoảng trắng hai đầu; không phải chuỗi → ''. */
const clean = (value) => (typeof value === 'string' ? value.normalize('NFC').trim() : '');
/** Đếm theo ký tự thật (không đếm nửa cặp surrogate). */
const lengthOf = (text) => [...text].length;

const valid = (value) => ({ ok: true, value });
const invalid = (field, message) => ({ ok: false, field, message });

export function validateName(value, field = 'customer.name') {
  const name = clean(value);
  if (!name) return invalid(field, 'Vui lòng nhập họ tên người nhận');
  if (lengthOf(name) < MIN_NAME_LENGTH) {
    return invalid(field, `Họ tên phải có ít nhất ${MIN_NAME_LENGTH} ký tự`);
  }
  return valid(name);
}

export function validatePhone(value, field = 'customer.phone') {
  const phone = clean(value);
  if (!phone) return invalid(field, 'Vui lòng nhập số điện thoại');
  if (!PHONE_PATTERN.test(phone)) {
    return invalid(
      field,
      'Số điện thoại không hợp lệ: nhập 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09 (ví dụ 0912345678)',
    );
  }
  return valid(phone.replace(/^\+84/, '0'));
}

export function validateAddress(value, field = 'customer.address') {
  const address = clean(value);
  if (!address) return invalid(field, 'Vui lòng nhập địa chỉ giao hàng');
  if (lengthOf(address) < MIN_ADDRESS_LENGTH) {
    return invalid(
      field,
      `Địa chỉ quá ngắn: ghi rõ số nhà, tên đường, phường/quận (ít nhất ${MIN_ADDRESS_LENGTH} ký tự)`,
    );
  }
  return valid(address);
}

/** Ghi chú không bắt buộc: bỏ trống → ''. */
export function validateNote(value, field = 'customer.note') {
  if (value === undefined || value === null) return valid('');
  if (typeof value !== 'string') return invalid(field, 'Ghi chú phải là chữ');
  const note = clean(value);
  if (lengthOf(note) > MAX_NOTE_LENGTH) {
    return invalid(field, `Ghi chú tối đa ${MAX_NOTE_LENGTH} ký tự, hiện có ${lengthOf(note)} ký tự`);
  }
  return valid(note);
}
