/**
 * ============================================================================
 * PATTERN: Observer (Behavioral) — PHỤ TRÁCH: TV2         [Sprint 2 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Khi đơn được tạo hoặc đổi trạng thái, nhiều nơi cần biết: trang theo dõi
 *   của khách, màn hình admin, nhật ký hệ thống. Nếu code đổi trạng thái tự
 *   gọi từng nơi thì mỗi lần thêm nơi nhận phải sửa code đó.
 *
 * Giải pháp:
 *   Nơi phát sinh sự kiện (Subject) chỉ gọi notify(event). Ai quan tâm thì
 *   tự đăng ký (attach) làm Observer.
 *
 * Cấu trúc GoF:
 *   Subject           = OrderSubject
 *   Observer          = OrderObserver (interface update(event))
 *   ConcreteObserver  = OrderLogObserver, CustomerStreamObserver, AdminFeedObserver
 *
 * Sự kiện:
 *   { type: 'ORDER_CREATED' | 'STATUS_CHANGED' | 'PAYMENT_UPDATED',
 *     orderId, status, paymentStatus?, from?, to?, at: ISO string }
 *
 * Hợp đồng:
 *   subject.attach(observer)   — thêm trùng thì bỏ qua
 *   subject.detach(observer)
 *   subject.notify(event)      — gọi observer.update(event) theo thứ tự attach;
 *                                một observer lỗi KHÔNG làm dừng các observer khác
 *                                (bắt lỗi rồi console.error)
 *   OrderLogObserver.getLogs(orderId?)            → bản sao mảng sự kiện đã nhận
 *   CustomerStreamObserver.addClient(orderId, res) → trả về hàm gỡ client
 *     update(): chỉ gửi cho client đang xem ĐÚNG orderId, định dạng SSE:
 *       res.write(`event: order\ndata: ${JSON.stringify(event)}\n\n`)
 *   AdminFeedObserver.addClient(res)              → trả về hàm gỡ client
 *     update(): gửi cho TẤT CẢ client admin, cùng định dạng SSE
 *
 * Instance dùng chung khai báo ở src/events.js.
 * Test chấp nhận: tests/observer.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */

const todo = (what) => {
  throw new Error(`TODO(TV2): chưa cài ${what}`);
};

/** Observer — interface */
export class OrderObserver {
  // eslint-disable-next-line no-unused-vars
  update(event) {
    return todo(`${this.constructor.name}.update()`);
  }
}

/** Subject */
export class OrderSubject {
  constructor() {
    this.observers = [];
  }

  // eslint-disable-next-line no-unused-vars
  attach(observer) { return todo('OrderSubject.attach()'); }
  // eslint-disable-next-line no-unused-vars
  detach(observer) { return todo('OrderSubject.detach()'); }
  // eslint-disable-next-line no-unused-vars
  notify(event) { return todo('OrderSubject.notify()'); }
}

// TODO(TV2): cài 3 ConcreteObserver
export class OrderLogObserver extends OrderObserver {
  constructor() {
    super();
    this.logs = [];
  }

  // eslint-disable-next-line no-unused-vars
  getLogs(orderId) { return todo('OrderLogObserver.getLogs()'); }
}

export class CustomerStreamObserver extends OrderObserver {
  constructor() {
    super();
    this.clients = new Map(); // orderId → Set<res>
  }

  // eslint-disable-next-line no-unused-vars
  addClient(orderId, res) { return todo('CustomerStreamObserver.addClient()'); }
}

export class AdminFeedObserver extends OrderObserver {
  constructor() {
    super();
    this.clients = new Set();
  }

  // eslint-disable-next-line no-unused-vars
  addClient(res) { return todo('AdminFeedObserver.addClient()'); }
}
