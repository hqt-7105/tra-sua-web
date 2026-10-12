/**
 * Đăng nhập admin/nhân viên — PHỤ TRÁCH: TV4 (Sprint 2)
 *
 * Tài khoản demo (src/data/users.json, chỉ dùng khi phát triển):
 *   admin@may.vn / admin123  (role admin)
 *   staff@may.vn / staff123  (role staff)
 *
 * Hợp đồng:
 *   authService.login(email, password) → { token, user: { id, email, name, role } }
 *     sai email hoặc mật khẩu → throw HttpError(401, 'Email hoặc mật khẩu không đúng')
 *     (KHÔNG nói rõ sai email hay sai mật khẩu)
 *   authService.verify(token)  → user | null   (token lạ hoặc quá config.sessionHours → null)
 *   authService.logout(token)  → xóa phiên
 *
 * Token = 32 byte ngẫu nhiên (hex), phiên lưu trong Map (khởi động lại server thì
 * phải đăng nhập lại). Mật khẩu kiểm tra bằng verifyPassword() (scrypt, BR21).
 */
import { randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { userRepository } from '../repositories/userRepository.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const SESSION_MS = config.sessionHours * 60 * 60 * 1000;
const LOGIN_FAILED = 'Email hoặc mật khẩu không đúng';

/** token → { user, expiresAt } */
const sessions = new Map();

/**
 * Email không tồn tại vẫn chạy scrypt với một hash giả, để thời gian trả lời
 * không để lộ email nào có tài khoản.
 */
let dummyHash;
const fakeVerify = (password) => {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  verifyPassword(password, dummyHash);
  return false;
};

const publicUser = ({ id, email, name, role }) => ({ id, email, name, role });

function removeExpired(now) {
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(token);
  }
}

export const authService = {
  login(email, password, now = Date.now()) {
    const user = userRepository.findByEmail(email);
    const secret = typeof password === 'string' ? password : '';
    const ok = user ? verifyPassword(secret, user.passwordHash) : fakeVerify(secret);
    if (!ok) throw new HttpError(401, LOGIN_FAILED);

    removeExpired(now);
    const token = randomBytes(32).toString('hex');
    sessions.set(token, { user: publicUser(user), expiresAt: now + SESSION_MS });
    return { token, user: publicUser(user) };
  },

  /** `now` chỉ để test giả thời gian hết phiên. */
  verify(token, now = Date.now()) {
    if (typeof token !== 'string') return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (session.expiresAt <= now) {
      sessions.delete(token);
      return null;
    }
    return { ...session.user };
  },

  logout(token) {
    sessions.delete(token);
  },
};
