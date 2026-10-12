/**
 * ============================================================================
 * PATTERN: Facade (Structural) — PHỤ TRÁCH: TV1
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
 * Ví dụ sử dụng (instance nối hệ thống con thật: src/services/orderFacadeInstance.js):
 *   const { order, payment } = await orderFacade.placeOrder({
 *     customer: { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1' },
 *     items: [{ drinkId: 'ts-truyen-thong', size: 'L', toppingIds: ['tran-chau-den'], quantity: 2 }],
 *     voucherCode: 'MAY10',
 *     paymentMethod: 'MOMO',
 *   });
 *   // order.status 'PENDING', order.total 97800, payment.redirectUrl '/payment/mock?gateway=momo&...'
 *
 * Test chấp nhận: tests/facade.test.js (dùng hệ thống con giả), tests/place-order.test.js (API)
 * ============================================================================
 */
import { Order } from '../behavioral/OrderState.js';
import { HttpError } from '../../middlewares/errorHandler.js';

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

  /**
   * Một lời gọi cho cả quy trình đặt đơn (UC06). Facade chỉ ĐIỀU PHỐI: mỗi bước giao
   * cho đúng hệ thống con, không tự kiểm tra dữ liệu, tính giảm giá hay gọi SDK.
   */
  async placeOrder(request) {
    // 1. Kiểm tra dữ liệu (Chain of Responsibility) — sai thì dừng ngay
    this.validator.validate(request);

    // 2. Dựng từng dòng món từ dữ liệu gốc, giá do server tính (Builder + Factory + Decorator)
    const items = request.items.map((line) => this.createItem(line));
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // 3. Giảm giá (Strategy) và tổng tiền (BR06, BR09)
    const { shippingFee } = this.config;
    const voucher = request.voucherCode
      ? this.voucherService.apply({ code: request.voucherCode, subtotal, shippingFee })
      : null;
    const discount = voucher?.discount ?? 0;
    const total = subtotal + shippingFee - discount;

    // 4. Tạo đơn ở trạng thái PENDING (State)
    const { customer } = request;
    const order = new Order({
      id: this.orderRepository.nextId(),
      customerName: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      note: customer.note?.trim() ?? '',
      items: items.map((item) => item.toJSON()),
      subtotal,
      shippingFee,
      discount,
      total,
      voucherCode: voucher ? (voucher.code ?? request.voucherCode) : null,
      paymentMethod: request.paymentMethod,
    });

    // 5. Thanh toán qua cổng tương ứng (Adapter) — cổng từ chối thì KHÔNG lưu đơn (BR18)
    const payment = await this.paymentGatewayFactory(request.paymentMethod).pay(order);
    if (payment.status === 'FAILED') throw new HttpError(402, payment.message);

    // 6. Lưu đơn với trạng thái thanh toán cổng trả về (BR16)
    order.paymentStatus = payment.status;
    this.orderRepository.save(order);

    // 7. Báo cho mọi nơi quan tâm (Observer): admin thấy đơn mới ngay
    this.orderEvents.notify({
      type: 'ORDER_CREATED',
      orderId: order.id,
      status: order.getStatus(),
      paymentStatus: order.paymentStatus,
      at: new Date().toISOString(),
    });

    return { order: order.toJSON(), payment };
  }
}
