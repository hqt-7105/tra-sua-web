/**
 * ============================================================================
 * PATTERN: Strategy (Behavioral) — PHỤ TRÁCH: TV4         [Sprint 1 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Có nhiều kiểu khuyến mãi (giảm %, giảm số tiền cố định, miễn phí ship...).
 *   Viết if/else theo loại voucher trong code giỏ hàng sẽ phải sửa mỗi khi có
 *   kiểu khuyến mãi mới.
 *
 * Giải pháp:
 *   Mỗi cách tính giảm giá là một lớp Strategy cùng interface calculate().
 *   DiscountContext (giỏ hàng/checkout) chỉ gọi strategy hiện tại, đổi
 *   strategy lúc chạy khi khách nhập mã khác.
 *
 * Cấu trúc GoF:
 *   Strategy          = DiscountStrategy
 *   ConcreteStrategy  = NoDiscount, PercentDiscount, FixedDiscount, FreeShipping
 *   Context           = DiscountContext
 *
 * Hợp đồng:
 *   strategy.calculate({ subtotal, shippingFee }) → số tiền giảm (VND, số nguyên)
 *     - không bao giờ âm, không vượt quá subtotal + shippingFee
 *   new PercentDiscount(percent, maxDiscount?)  percent 1..100, làm tròn xuống
 *   new FixedDiscount(amount)
 *   new FreeShipping()                          giảm đúng bằng shippingFee
 *   new DiscountContext(strategy?).checkout({ subtotal, shippingFee })
 *     → { subtotal, shippingFee, discount, total }
 *   createDiscountStrategy(voucher) → strategy theo voucher.type
 *     ('percent' | 'fixed' | 'freeship'), type lạ → throw Error
 *
 * Kiểm tra hạn dùng / đơn tối thiểu của voucher KHÔNG nằm trong strategy;
 * viết ở src/services/voucherService.js (TV4 tạo).
 *
 * Test chấp nhận: tests/strategy.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */

const todo = (what) => {
  throw new Error(`TODO(TV4): chưa cài ${what}`);
};

/** Strategy trừu tượng */
export class DiscountStrategy {
  /**
   * @param {{ subtotal: number, shippingFee: number }} cart
   * @returns {number} số tiền được giảm
   */
  // eslint-disable-next-line no-unused-vars
  calculate(cart) {
    return todo(`${this.constructor.name}.calculate()`);
  }
}

export class NoDiscount extends DiscountStrategy {
  calculate() {
    return 0;
  }
}

// TODO(TV4): cài calculate() cho 3 lớp dưới
export class PercentDiscount extends DiscountStrategy {
  constructor(percent, maxDiscount = Infinity) {
    super();
    this.percent = percent;
    this.maxDiscount = maxDiscount;
  }
}

export class FixedDiscount extends DiscountStrategy {
  constructor(amount) {
    super();
    this.amount = amount;
  }
}

export class FreeShipping extends DiscountStrategy {}

/** Context */
export class DiscountContext {
  constructor(strategy = new NoDiscount()) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
    return this;
  }

  // eslint-disable-next-line no-unused-vars
  checkout({ subtotal, shippingFee = 0 }) {
    return todo('DiscountContext.checkout()');
  }
}

// eslint-disable-next-line no-unused-vars
export function createDiscountStrategy(voucher) {
  return todo('createDiscountStrategy()');
}
