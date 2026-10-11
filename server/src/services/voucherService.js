/**
 * Dịch vụ mã giảm giá — PHỤ TRÁCH: TV4 (Sprint 1). Client của Strategy.
 *
 * Tách bạch trách nhiệm:
 *   - voucherService: mã có tồn tại không, còn hạn không, còn lượt không, đơn
 *     đủ tối thiểu chưa (BR07).
 *   - Strategy (DiscountStrategy.js): chỉ tính số tiền giảm (BR08).
 *
 * Hợp đồng (Sprint 2: OrderFacade gọi apply):
 *   voucherService.apply({ code, subtotal, shippingFee, now })
 *     → { code, type, discount, total, message }
 *     mã không tồn tại → HttpError(404); hết hạn / hết lượt / chưa đủ tối thiểu → HttpError(400)
 *     dữ liệu đầu vào sai → HttpError(400) kèm field
 *   voucherService.listActive({ now }) → [{ code, type, message, minOrder, expiresAt }]
 *     các mã còn dùng được, cho mục Khuyến mãi ở trang chủ
 */
import { config } from '../config.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { voucherRepository } from '../repositories/voucherRepository.js';
import {
  DiscountContext,
  createDiscountStrategy,
} from '../patterns/behavioral/DiscountStrategy.js';

const vnd = new Intl.NumberFormat('vi-VN');
const money = (value) => `${vnd.format(value)}đ`;

const invalid = (field, message) => Object.assign(new HttpError(400, message), { field });
const isMoney = (value) => Number.isInteger(value) && value >= 0;

const isExpired = (voucher, now) => now > new Date(voucher.expiresAt);
const isUsedUp = (voucher) =>
  voucher.usageLimit != null && (voucher.usedCount ?? 0) >= voucher.usageLimit;

/** Kiểm tra điều kiện dùng mã (BR07). Sai thì ném lỗi với thông báo cụ thể. */
function assertUsable(voucher, subtotal, now) {
  if (isExpired(voucher, now)) {
    throw new HttpError(400, `Mã ${voucher.code} đã hết hạn`);
  }
  if (isUsedUp(voucher)) {
    throw new HttpError(400, `Mã ${voucher.code} đã hết lượt sử dụng`);
  }
  const minOrder = voucher.minOrder ?? 0;
  if (subtotal < minOrder) {
    throw new HttpError(
      400,
      `Mã ${voucher.code} áp dụng cho đơn từ ${money(minOrder)}, bạn cần mua thêm ${money(minOrder - subtotal)}`,
    );
  }
}

export const voucherService = {
  apply({ code, subtotal, shippingFee = config.shippingFee, now = new Date() } = {}) {
    if (typeof code !== 'string' || !code.trim()) {
      throw invalid('code', 'Vui lòng nhập mã giảm giá');
    }
    if (!isMoney(subtotal)) {
      throw invalid('subtotal', 'Tạm tính phải là số nguyên VND không âm');
    }
    if (!isMoney(shippingFee)) {
      throw invalid('shippingFee', 'Phí giao hàng phải là số nguyên VND không âm');
    }

    const voucher = voucherRepository.findByCode(code.trim().toUpperCase());
    if (!voucher) {
      throw new HttpError(404, `Mã giảm giá "${code.trim()}" không tồn tại`);
    }
    assertUsable(voucher, subtotal, now);

    const strategy = createDiscountStrategy(voucher);
    const { discount, total } = new DiscountContext(strategy).checkout({ subtotal, shippingFee });
    return { code: voucher.code, type: voucher.type, discount, total, message: strategy.describe() };
  },

  listActive({ now = new Date() } = {}) {
    return voucherRepository
      .getAll()
      .filter((v) => !isExpired(v, now) && !isUsedUp(v))
      .map((v) => ({
        code: v.code,
        type: v.type,
        message: createDiscountStrategy(v).describe(),
        minOrder: v.minOrder ?? 0,
        expiresAt: v.expiresAt,
      }));
  },
};
