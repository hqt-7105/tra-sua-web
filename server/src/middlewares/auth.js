/**
 * Middleware xác thực cho /api/admin/* — PHỤ TRÁCH: TV4 (Sprint 2)
 *
 * Hợp đồng:
 *   router.get('/orders', requireAuth('admin', 'staff'), handler)
 *   - Đọc header  Authorization: Bearer <token>
 *     (riêng SSE /api/admin/events: EventSource không gửi được header, cho phép ?token=...)
 *   - authService.verify(token) → null  → 401 'Vui lòng đăng nhập'
 *   - role không nằm trong danh sách     → 403 'Bạn không có quyền thực hiện thao tác này'
 *   - hợp lệ → req.user = user; req.token = token; next()
 *
 * ?token chỉ được nhận khi trình duyệt mở luồng SSE (Accept: text/event-stream),
 * để token không lọt vào URL của các request thường.
 */
import { HttpError } from './errorHandler.js';
import { authService } from '../services/authService.js';

const BEARER = /^Bearer\s+(\S+)$/i;

function readToken(req) {
  const header = BEARER.exec(req.get('authorization') ?? '');
  if (header) return header[1];
  const wantsEventStream = (req.get('accept') ?? '').includes('text/event-stream');
  if (wantsEventStream && typeof req.query.token === 'string') return req.query.token;
  return null;
}

export function requireAuth(...roles) {
  return (req, res, next) => {
    const token = readToken(req);
    const user = token ? authService.verify(token) : null;
    if (!user) return next(new HttpError(401, 'Vui lòng đăng nhập'));
    if (roles.length > 0 && !roles.includes(user.role)) {
      return next(new HttpError(403, 'Bạn không có quyền thực hiện thao tác này'));
    }
    req.user = user;
    req.token = token;
    return next();
  };
}
