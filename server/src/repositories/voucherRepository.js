import { readFileSync } from 'node:fs';

/**
 * Repository mã giảm giá — PHỤ TRÁCH: TV4.
 * Sprint 1-2 đọc từ src/data/vouchers.json; Sprint 3 chuyển sang CSDL chỉ cần
 * viết lại file này.
 *
 * Hợp đồng:
 *   voucherRepository.findByCode(code) → voucher | null (code đã chuẩn hóa IN HOA)
 *   voucherRepository.getAll()         → bản sao danh sách voucher
 */
const vouchers = JSON.parse(
  readFileSync(new URL('../data/vouchers.json', import.meta.url), 'utf-8'),
);

export const voucherRepository = {
  findByCode(code) {
    return vouchers.find((v) => v.code === code) || null;
  },

  getAll() {
    return vouchers.map((v) => ({ ...v }));
  },
};
