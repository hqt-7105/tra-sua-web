/**
 * ============================================================================
 * PATTERN: Facade (Structural) — PHỤ TRÁCH: TV1           [Sprint 2 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Đặt một đơn phải đi qua 6-7 hệ thống con: kiểm tra hợp lệ (Chain of
 *   Responsibility), dựng món (Builder + Factory + Decorator), giảm giá
 *   (Strategy), tạo đơn (State), thanh toán (Adapter), lưu đơn, phát sự kiện
 *   (Observer). Nếu route tự gọi từng bước thì route rất dài, dễ sai thứ tự,
 *   và frontend/route khác muốn đặt đơn lại phải chép lại.
 *
 * Giải pháp:
 *   OrderFacade gom toàn bộ thành MỘT lời gọi placeOrder(request).
 *
 * Cấu trúc GoF:
 *   Facade      = OrderFacade
 *   Subsystems  = validator, createItem, voucherService, paymentGatewayFactory,
 *                 orderRepository, orderEvents (truyền vào qua constructor)
 *   Client      = route POST /api/orders
 *
 * Hợp đồng:
 *   const facade = new OrderFacade({
 *     validator,             // { validate(request) }  throw ValidationError nếu sai   (TV5 - S2)
 *     createItem,            // (line) => OrderItem { totalPrice, toJSON() }             (TV3 - S1)
 *     voucherService,        // { apply({ code, subtotal, shippingFee }) } → { discount, total, ... } (TV4 - S1)
 *     paymentGatewayFactory, // (method) => PaymentGateway                              (TV3 - S2)
 *     orderRepository,       // { nextId(), save(order) }                               (TV5 - S1)
 *     orderEvents,           // { notify(event) }                                        (TV2 - S2)
 *     config,                // { shippingFee }
 *   });
 *
 *   await facade.placeOrder(request) → { order: <order.toJSON()>, payment: PaymentResult }
 *     request = {
 *       customer: { name, phone, address, note },
 *       items: [{ drinkId, size, sugar, ice, toppingIds, quantity, note }],
 *       voucherCode,            // có thể bỏ trống
 *       paymentMethod,          // 'COD' | 'MOMO' | 'VNPAY'
 *     }
 *
 *   Thứ tự BẮT BUỘC:
 *     1. validator.validate(request)        — lỗi thì dừng ngay, không gọi gì thêm
 *     2. items = request.items.map(createItem); subtotal = Σ item.totalPrice
 *     3. có voucherCode → voucherService.apply(...); không có → discount 0
 *        total = subtotal + shippingFee - discount
 *     4. id = orderRepository.nextId(); order = new Order({...})  (trạng thái PENDING)
 *     5. payment = await paymentGatewayFactory(method).pay(order)
 *        payment.status === 'FAILED' → throw HttpError(402, payment.message), KHÔNG lưu đơn
 *     6. order.paymentStatus = payment.status; orderRepository.save(order)
 *     7. orderEvents.notify({ type: 'ORDER_CREATED', orderId, status, paymentStatus, at })
 *
 * Test chấp nhận: tests/facade.test.js (dùng hệ thống con giả, không cần chờ
 * người khác làm xong). Bỏ `todo` khi làm xong.
 * ============================================================================
 */
// import { Order } from '../behavioral/OrderState.js';
// import { HttpError } from '../../middlewares/errorHandler.js';

export class OrderFacade {
  constructor({
    validator,
    createItem,
    voucherService,
    paymentGatewayFactory,
    orderRepository,
    orderEvents,
    config,
  }) {
    this.validator = validator;
    this.createItem = createItem;
    this.voucherService = voucherService;
    this.paymentGatewayFactory = paymentGatewayFactory;
    this.orderRepository = orderRepository;
    this.orderEvents = orderEvents;
    this.config = config;
  }

  // eslint-disable-next-line no-unused-vars
  async placeOrder(request) {
    throw new Error('TODO(TV1): chưa cài OrderFacade.placeOrder()');
  }
}
