/**
 * Giới hạn tần suất request theo IP — PHỤ TRÁCH: TV4 (B4). Lưu trong bộ nhớ (Map), không thư viện ngoài.
 *
 *   router.post('/login', rateLimit({ windowMs: 60_000, max: 5, skipSuccessfulRequests: true }), handler);
 *
 * Tham số:
 *   windowMs               độ dài cửa sổ thời gian (ms)
 *   max                    số request tối đa mỗi IP trong một cửa sổ; request thứ max + 1 → 429
 *   message                thông báo tiếng Việt khi bị chặn
 *   skipSuccessfulRequests chỉ đếm request bị lỗi (status ≥ 400) — dùng cho đăng nhập: chặn dò
 *                          mật khẩu nhưng nhân viên đăng nhập đúng nhiều lần không bị khóa
 *   now                    () => thời điểm hiện tại (ms), để test giả đồng hồ
 *
 * Bị chặn → 429 { error } kèm header Retry-After (giây). Bản ghi hết hạn được dọn định kỳ
 * (mỗi windowMs) để Map không phình mãi. middleware.size() cho biết số IP đang được theo dõi.
 */
import { HttpError } from './errorHandler.js';

export function rateLimit({
  windowMs,
  max,
  message = 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút',
  skipSuccessfulRequests = false,
  now = Date.now,
} = {}) {
  if (!Number.isInteger(windowMs) || windowMs <= 0 || !Number.isInteger(max) || max <= 0) {
    throw new TypeError('rateLimit cần windowMs và max là số nguyên dương');
  }
  /** ip → { count, resetAt } */
  const hits = new Map();
  let nextSweep = now() + windowMs;

  const sweep = (time) => {
    if (time < nextSweep) return;
    for (const [ip, entry] of hits) {
      if (entry.resetAt <= time) hits.delete(ip);
    }
    nextSweep = time + windowMs;
  };

  const entryFor = (ip, time) => {
    let entry = hits.get(ip);
    if (!entry || entry.resetAt <= time) {
      entry = { count: 0, resetAt: time + windowMs };
      hits.set(ip, entry);
    }
    return entry;
  };

  const middleware = (req, res, next) => {
    const time = now();
    sweep(time);
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const entry = entryFor(ip, time);

    if (entry.count >= max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - time) / 1000)));
      return next(new HttpError(429, message));
    }

    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode >= 400) entryFor(ip, now()).count += 1;
      });
    } else {
      entry.count += 1;
    }
    return next();
  };

  middleware.size = () => hits.size;
  return middleware;
}
