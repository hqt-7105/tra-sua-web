/**
 * ============================================================================
 * PATTERN: Chain of Responsibility (Behavioral) — PHỤ TRÁCH: TV5
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
 *                                  (note ≤ 200 ký tự nếu có           field 'customer.note')
 *                                  quy tắc lấy từ src/utils/validators.js (dùng chung với Checkout)
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
 * Ví dụ sử dụng:
 *   const chain = buildOrderValidationChain({ menuRepository });
 *   chain.validate(request);   // true, hoặc throw ValidationError('customer.phone', '...')
 *   // Thêm điều kiện mới (ví dụ giới hạn số ly mỗi đơn) = viết thêm một Handler
 *   // rồi nối vào buildOrderValidationChain(), không sửa handler nào khác.
 *
 * Test chấp nhận: tests/chain.test.js
 * ============================================================================
 */
import { HttpError } from '../../middlewares/errorHandler.js';
import { config } from '../../config.js';
import { validateAddress, validateName, validateNote, validatePhone } from '../../utils/validators.js';

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

/** 1. BR10: đơn phải có ít nhất một dòng món. */
export class CartNotEmptyHandler extends OrderValidationHandler {
  validate(request) {
    const items = request?.items;
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('items', 'Giỏ hàng đang trống, vui lòng chọn ít nhất một món');
    }
    return super.validate(request);
  }
}

/**
 * 2. BR11: họ tên, số điện thoại, địa chỉ (và ghi chú nếu có). Quy tắc nằm ở
 * utils/validators.js (dùng chung với form Checkout), handler chỉ đổi kết quả
 * { ok: false } thành lỗi để dừng chuỗi.
 */
export class DeliveryInfoHandler extends OrderValidationHandler {
  validate(request) {
    const customer = request?.customer ?? {};
    const results = [
      validateName(customer.name),
      validatePhone(customer.phone),
      validateAddress(customer.address),
      validateNote(customer.note),
    ];
    const failed = results.find((result) => !result.ok);
    if (failed) throw new ValidationError(failed.field, failed.message);
    return super.validate(request);
  }
}

/** 3. BR12: phương thức thanh toán phải nằm trong config.paymentMethods. */
export class PaymentMethodHandler extends OrderValidationHandler {
  validate(request) {
    if (!config.paymentMethods.includes(request?.paymentMethod)) {
      throw new ValidationError('paymentMethod', 'Vui lòng chọn phương thức thanh toán: COD, MoMo hoặc VNPay');
    }
    return super.validate(request);
  }
}

/**
 * 4. BR13: mọi món và topping đang bán, số lượng mỗi dòng là số nguyên 1..20.
 * menuRepository trả null cho món/topping không có hoặc đã ngừng bán (BR23).
 * Thiếu quantity thì coi là mặc định 1 (BR03), giống Builder.
 */
export class ItemsAvailableHandler extends OrderValidationHandler {
  constructor(menuRepository) {
    super();
    this.menuRepository = menuRepository;
  }

  validate(request) {
    request.items.forEach((item, i) => this.#checkItem(item ?? {}, i));
    return super.validate(request);
  }

  #checkItem({ drinkId, toppingIds = [], quantity = 1 }, i) {
    const position = `Món thứ ${i + 1}`;
    if (typeof drinkId !== 'string' || !this.menuRepository.getDrinkById(drinkId)) {
      throw new ValidationError(`items[${i}].drinkId`, `${position} không có hoặc đã ngừng bán, vui lòng xóa khỏi giỏ`);
    }
    const toppingsOk =
      Array.isArray(toppingIds) &&
      toppingIds.every((id) => typeof id === 'string' && this.menuRepository.getToppingById(id));
    if (!toppingsOk) {
      throw new ValidationError(`items[${i}].toppingIds`, `${position} có topping đã ngừng bán, vui lòng chọn lại`);
    }
    const max = config.maxQuantityPerItem;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) {
      throw new ValidationError(`items[${i}].quantity`, `${position}: số lượng phải là số nguyên từ 1 đến ${max}`);
    }
  }
}

/** 5. BR14: chỉ nhận đơn từ 08:00 đến trước 22:00 giờ Việt Nam. clock() → giờ 0-23. */
export class StoreOpenHandler extends OrderValidationHandler {
  constructor(clock = currentHourInVietnam) {
    super();
    this.clock = clock;
  }

  validate(request) {
    const { open, close } = config.storeHours;
    const hour = this.clock();
    if (hour < open || hour >= close) {
      const pad = (h) => `${String(h).padStart(2, '0')}:00`;
      throw new ValidationError(
        'store',
        `Cửa hàng đang đóng cửa, chỉ nhận đơn từ ${pad(open)} đến ${pad(close)}. Hẹn gặp bạn vào giờ mở cửa nhé!`,
      );
    }
    return super.validate(request);
  }
}

/** Nối 5 handler theo đúng thứ tự trong hợp đồng, trả handler đầu chuỗi. */
export function buildOrderValidationChain({ menuRepository, clock = currentHourInVietnam } = {}) {
  const head = new CartNotEmptyHandler();
  head
    .setNext(new DeliveryInfoHandler())
    .setNext(new PaymentMethodHandler())
    .setNext(new ItemsAvailableHandler(menuRepository))
    .setNext(new StoreOpenHandler(clock));
  return head;
}
