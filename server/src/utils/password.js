/**
 * Băm và kiểm tra mật khẩu bằng scrypt (có sẵn trong Node) — ĐÃ CÀI SẴN.
 * Định dạng lưu: 'scrypt$<salt hex>$<hash hex>'
 *
 * Tạo hash cho tài khoản mới:  node server/scripts/hash-password.js <mật-khẩu>
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 32;

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    throw new TypeError('Mật khẩu phải có ít nhất 6 ký tự');
  }
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [algo, salt, hash] = String(stored).split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(String(password), salt, expected.length);
  return timingSafeEqual(actual, expected);
}
