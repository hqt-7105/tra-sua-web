/**
 * Đăng nhập admin/nhân viên — PHỤ TRÁCH: TV4 (Sprint 2)          [CHƯA LÀM]
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
 * Gợi ý: token = randomBytes(32).toString('hex'); phiên lưu trong Map;
 * kiểm tra mật khẩu bằng verifyPassword() trong src/utils/password.js (đã có).
 */
// import { randomBytes } from 'node:crypto';
// import { verifyPassword } from '../utils/password.js';

const todo = (method) => {
  throw new Error(`TODO(TV4): chưa cài authService.${method}()`);
};

export const authService = {
  // eslint-disable-next-line no-unused-vars
  login: (email, password) => todo('login'),
  // eslint-disable-next-line no-unused-vars
  verify: (token) => todo('verify'),
  // eslint-disable-next-line no-unused-vars
  logout: (token) => todo('logout'),
};
