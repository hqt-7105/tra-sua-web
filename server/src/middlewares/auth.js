/**
 * Middleware xác thực cho /api/admin/* — PHỤ TRÁCH: TV4 (Sprint 2)
 *
 * ⚠️  HIỆN ĐANG LÀ BẢN TẠM: cho qua mọi request và giả làm admin để TV2, TV5
 *     làm được trang admin trong lúc TV4 chưa xong. TV4 PHẢI thay trước demo.
 *
 * Hợp đồng:
 *   router.get('/orders', requireAuth('admin', 'staff'), handler)
 *   - Đọc header  Authorization: Bearer <token>
 *     (riêng SSE /api/admin/events: EventSource không gửi được header, cho phép ?token=...)
 *   - authService.verify(token) → null  → 401 'Vui lòng đăng nhập'
 *   - role không nằm trong danh sách     → 403 'Bạn không có quyền thực hiện thao tác này'
 *   - hợp lệ → req.user = user; next()
 */
let warned = false;

// eslint-disable-next-line no-unused-vars
export function requireAuth(...roles) {
  return (req, res, next) => {
    // TODO(TV4): thay toàn bộ phần dưới bằng kiểm tra token thật
    if (!warned) {
      console.warn('⚠️  requireAuth đang ở chế độ tạm: chưa kiểm tra đăng nhập (TV4)');
      warned = true;
    }
    req.user = { id: 0, email: 'dev@local', name: 'Dev (chưa bật xác thực)', role: 'admin' };
    next();
  };
}
