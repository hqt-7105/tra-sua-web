/**
 * ============================================================================
 * PATTERN: Strategy (Behavioral) — PHỤ TRÁCH: TV4
 * ============================================================================
 * Vấn đề:
 *   Có nhiều kiểu khuyến mãi (giảm %, giảm số tiền cố định, miễn phí ship...).
 *   Viết if/else theo loại voucher trong code giỏ hàng sẽ phải sửa mỗi khi có
 *   kiểu khuyến mãi mới.
 *
 * Giải pháp:
 *   Mỗi cách tính giảm giá là một lớp Strategy cùng interface calculate().
 *   DiscountContext (giỏ hàng/checkout) chỉ gọi strategy hiện tại, đổi
 *   strategy lúc chạy khi khách nhập mã khác. Thêm kiểu khuyến mãi mới = thêm
 *   một lớp + một dòng trong STRATEGY_BY_TYPE, không sửa Context.
 *
 * Cấu trúc GoF:
 *   Strategy          = DiscountStrategy        (calculate, describe)
 *   ConcreteStrategy  = NoDiscount, PercentDiscount, FixedDiscount, FreeShipping
 *   Context           = DiscountContext         (checkout)
 *   Client            = voucherService (src/services/voucherService.js)
 *
 * Hợp đồng:
 *   strategy.calculate({ subtotal, shippingFee }) → số tiền giảm (VND, số nguyên)
 *     - không bao giờ âm, không vượt quá subtotal + shippingFee
 *   strategy.describe() → mô tả cho khách, ví dụ "Giảm 10% (tối đa 20.000đ)"
 *   new PercentDiscount(percent, maxDiscount?)  percent 1..100, làm tròn xuống
 *   new FixedDiscount(amount)
 *   new FreeShipping()                          giảm đúng bằng shippingFee
 *   new DiscountContext(strategy?).checkout({ subtotal, shippingFee })
 *     → { subtotal, shippingFee, discount, total }
 *   createDiscountStrategy(voucher) → strategy theo voucher.type
 *     ('percent' | 'fixed' | 'freeship'), type lạ → throw Error
 *
 * Kiểm tra hạn dùng / đơn tối thiểu của voucher KHÔNG nằm trong strategy;
 * viết ở src/services/voucherService.js.
 *
 * Ví dụ:
 *   const context = new DiscountContext();                 // NoDiscount
 *   context.checkout({ subtotal: 100000, shippingFee: 15000 }).total;  // 115000
 *   context.setStrategy(new PercentDiscount(10, 20000));
 *   context.checkout({ subtotal: 100000, shippingFee: 15000 }).total;  // 105000
 *
 * Test chấp nhận: tests/strategy.test.js
 * ============================================================================
 */

const vnd = new Intl.NumberFormat('vi-VN');
const money = (value) => `${vnd.format(value)}đ`;

/**
 * Giới hạn số tiền giảm theo BR08: không âm, không vượt tạm tính + phí ship.
 * Mọi ConcreteStrategy đều đi qua hàm này nên quy tắc chỉ viết một lần.
 */
function limitDiscount(amount, { subtotal, shippingFee = 0 }) {
  return Math.max(0, Math.min(Math.floor(amount), subtotal + shippingFee));
}

/** Strategy trừu tượng */
export class DiscountStrategy {
  /**
   * @param {{ subtotal: number, shippingFee: number }} cart
   * @returns {number} số tiền được giảm
   */
  // eslint-disable-next-line no-unused-vars
  calculate(cart) {
    throw new Error(`${this.constructor.name} phải cài đặt calculate()`);
  }

  /** @returns {string} mô tả khuyến mãi hiển thị cho khách */
  describe() {
    throw new Error(`${this.constructor.name} phải cài đặt describe()`);
  }
}

export class NoDiscount extends DiscountStrategy {
  calculate() {
    return 0;
  }

  describe() {
    return 'Không áp dụng giảm giá';
  }
}

/** Giảm theo % tạm tính, làm tròn xuống, có trần maxDiscount (nếu có). */
export class PercentDiscount extends DiscountStrategy {
  constructor(percent, maxDiscount = Infinity) {
    super();
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      throw new TypeError('Phần trăm giảm phải là số nguyên từ 1 đến 100');
    }
    this.percent = percent;
    this.maxDiscount = maxDiscount ?? Infinity;
  }

  calculate(cart) {
    const byPercent = Math.floor((cart.subtotal * this.percent) / 100);
    return limitDiscount(Math.min(byPercent, this.maxDiscount), cart);
  }

  describe() {
    const cap = Number.isFinite(this.maxDiscount) ? ` (tối đa ${money(this.maxDiscount)})` : '';
    return `Giảm ${this.percent}%${cap}`;
  }
}

/** Giảm một số tiền cố định. */
export class FixedDiscount extends DiscountStrategy {
  constructor(amount) {
    super();
    if (!Number.isInteger(amount) || amount < 0) {
      throw new TypeError('Số tiền giảm phải là số nguyên không âm (VND)');
    }
    this.amount = amount;
  }

  calculate(cart) {
    return limitDiscount(this.amount, cart);
  }

  describe() {
    return `Giảm ${money(this.amount)}`;
  }
}

/** Miễn phí giao hàng: giảm đúng bằng phí ship. */
export class FreeShipping extends DiscountStrategy {
  calculate(cart) {
    return limitDiscount(cart.shippingFee ?? 0, cart);
  }

  describe() {
    return 'Miễn phí giao hàng';
  }
}

/** Context */
export class DiscountContext {
  constructor(strategy = new NoDiscount()) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
    return this;
  }

  /** Tính tiền đơn bằng strategy hiện tại (BR09: tổng = tạm tính + ship − giảm). */
  checkout({ subtotal, shippingFee = 0 }) {
    const discount = this.strategy.calculate({ subtotal, shippingFee });
    return { subtotal, shippingFee, discount, total: subtotal + shippingFee - discount };
  }
}

/** Loại voucher (voucher.type trong vouchers.json) → cách tạo strategy tương ứng. */
const STRATEGY_BY_TYPE = {
  percent: (voucher) => new PercentDiscount(voucher.value, voucher.maxDiscount),
  fixed: (voucher) => new FixedDiscount(voucher.value),
  freeship: () => new FreeShipping(),
};

export function createDiscountStrategy(voucher) {
  const create = STRATEGY_BY_TYPE[voucher?.type];
  if (!create) {
    throw new Error(`Không hỗ trợ loại mã giảm giá: ${voucher?.type}`);
  }
  return create(voucher);
}
