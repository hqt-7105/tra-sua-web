/**
 * ============================================================================
 * PATTERN: Chain of Responsibility (Behavioral) — PHỤ TRÁCH: TV5   [Sprint 2]
 * ============================================================================
 * Vấn đề:
 *   Trước khi tạo đơn phải kiểm tra nhiều điều kiện độc lập: giỏ có món, thông
 *   tin giao hàng hợp lệ, phương thức thanh toán, món còn bán, cửa hàng đang
 *   mở cửa... Viết dồn vào một hàm dài thì khó thêm/bớt/đổi thứ tự.
 *
 * Giải pháp:
 *   Mỗi điều kiện là một Handler. Handler tự kiểm tra phần của mình, sai thì
 *   dừng chuỗi (throw), đúng thì chuyển cho Handler kế tiếp.
 *
 * Cấu trúc GoF:
 *   Handler          = OrderValidationHandler (có setNext, validate)
 *   ConcreteHandler  = CartNotEmptyHandler, DeliveryInfoHandler, PaymentMethodHandler,
 *                      ItemsAvailableHandler, StoreOpenHandler
 *   Client           = OrderFacade (TV1)
 *
 * Hợp đồng:
 *   handler.setNext(next) → trả về `next` để nối chuỗi: a.setNext(b).setNext(c)
 *   handler.validate(request) → true nếu cả chuỗi hợp lệ;
 *                               sai → throw ValidationError(field, message) ngay tại handler đó
 *   request: xem OrderFacade.js
 *
 *   Thứ tự chuỗi và quy tắc (DAC_TA.md, mục BR):
 *     1. CartNotEmptyHandler       items là mảng có ≥ 1 phần tử        field 'items'
 *     2. DeliveryInfoHandler       name ≥ 2 ký tự (bỏ khoảng trắng)    field 'customer.name'
 *                                  phone khớp /^(0|\+84)(3|5|7|8|9)\d{8}$/  'customer.phone'
 *                                  address ≥ 10 ký tự                 field 'customer.address'
 *     3. PaymentMethodHandler      thuộc config.paymentMethods         field 'paymentMethod'
 *     4. ItemsAvailableHandler     drinkId còn bán                     field 'items[i].drinkId'
 *                                  mọi toppingId còn bán               field 'items[i].toppingIds'
 *                                  quantity nguyên 1..20               field 'items[i].quantity'
 *                                  (dùng menuRepository.getDrinkById / getToppingById, trả null = không bán)
 *     5. StoreOpenHandler          giờ VN trong [08, 22)               field 'store'
 *
 *   buildOrderValidationChain({ menuRepository, clock }) → handler đầu chuỗi
 *     clock: () => số giờ hiện tại (0-23) theo giờ VN, mặc định currentHourInVietnam
 *
 * Test chấp nhận: tests/chain.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */
import { HttpError } from '../../middlewares/errorHandler.js';
import { config } from '../../config.js';

export class ValidationError extends HttpError {
  constructor(field, message) {
    super(400, message);
    this.field = field;
  }
}

/** Giờ hiện tại (0-23) theo múi giờ Việt Nam — đã cài sẵn. */
export function currentHourInVietnam(date = new Date()) {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone: config.timezone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(date);
  return Number(hour);
}

/** Handler gốc: chưa kiểm tra gì, chỉ chuyển tiếp. */
export class OrderValidationHandler {
  constructor() {
    this.next = null;
  }

  /** @returns {OrderValidationHandler} chính handler vừa nối, để viết a.setNext(b).setNext(c) */
  setNext(handler) {
    this.next = handler;
    return handler;
  }

  validate(request) {
    return this.next ? this.next.validate(request) : true;
  }
}

// TODO(TV5): cài 5 ConcreteHandler, mỗi lớp override validate():
//   validate(request) {
//     if (<sai>) throw new ValidationError('<field>', '<thông báo tiếng Việt>');
//     return super.validate(request);   // chuyển cho handler kế tiếp
//   }

// eslint-disable-next-line no-unused-vars
export function buildOrderValidationChain({ menuRepository, clock = currentHourInVietnam } = {}) {
  throw new Error('TODO(TV5): chưa cài buildOrderValidationChain()');
}
