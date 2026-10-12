/**
 * Header bảo mật cơ bản cho mọi response — PHỤ TRÁCH: TV4 (B4). Không dùng thư viện ngoài.
 *
 *   app.use(securityHeaders);
 *
 * - X-Content-Type-Options: nosniff   trình duyệt không tự đoán kiểu file (chặn chạy nhầm script)
 * - X-Frame-Options: DENY             không cho nhúng trang vào iframe (chống clickjacking)
 * - Referrer-Policy: no-referrer      không gửi URL hiện tại (có thể chứa ?token=) sang trang khác
 * - Bỏ X-Powered-By                   không lộ server dùng Express
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

export function securityHeaders(req, res, next) {
  res.set(SECURITY_HEADERS);
  res.removeHeader('X-Powered-By');
  next();
}
