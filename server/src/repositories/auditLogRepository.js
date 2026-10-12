/**
 * Nhật ký thay đổi menu (BR22) — PHỤ TRÁCH: TV4 (Sprint 2).
 * Lưu trong bộ nhớ; Sprint 3 chuyển sang bảng AUDIT_LOGS chỉ cần viết lại file này.
 *
 * Hợp đồng:
 *   auditLogRepository.push({ at, email, action, targetId })   — MenuServiceProxy gọi
 *   auditLogRepository.findAll() → bản sao, mới nhất trước
 * Có hàm push() giống mảng nên truyền thẳng làm `auditLog` cho MenuServiceProxy.
 */
const entries = [];

export const auditLogRepository = {
  push(entry) {
    entries.push({ ...entry });
    return entries.length;
  },

  findAll() {
    return entries.map((entry) => ({ ...entry })).reverse();
  },
};
