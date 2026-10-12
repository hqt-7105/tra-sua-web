/**
 * ============================================================================
 * PATTERN: Observer (Behavioral) — PHỤ TRÁCH: TV2
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
 *
 * Ví dụ sử dụng:
 *   orderEvents.attach(adminFeed);                    // events.js đăng ký sẵn 3 observer
 *   orderEvents.notify({ type: 'STATUS_CHANGED', orderId: 'DH001', status: 'PREPARING',
 *                        from: 'PENDING', to: 'PREPARING', at: new Date().toISOString() });
 *   // → nhật ký lưu lại, khách đang xem DH001 và mọi màn hình admin nhận SSE
 *   // Thêm nơi nhận mới (ví dụ gửi SMS) = viết một Observer và attach, không sửa nơi phát.
 *
 * Test chấp nhận: tests/observer.test.js, tests/events.test.js (API SSE)
 * ============================================================================
 */

/** Observer — interface */
export class OrderObserver {
  // eslint-disable-next-line no-unused-vars
  update(event) {
    throw new Error(`${this.constructor.name} phải cài đặt update()`);
  }
}

/** Subject */
export class OrderSubject {
  constructor() {
    this.observers = [];
  }

  /** Đăng ký nhận sự kiện; đăng ký trùng thì bỏ qua. */
  attach(observer) {
    if (!this.observers.includes(observer)) this.observers.push(observer);
    return this;
  }

  detach(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
    return this;
  }

  /**
   * Báo cho mọi observer theo thứ tự đăng ký. Subject không biết observer làm gì;
   * một observer lỗi chỉ ghi console.error, các observer sau vẫn nhận sự kiện.
   */
  notify(event) {
    for (const observer of [...this.observers]) {
      try {
        observer.update(event);
      } catch (err) {
        console.error(`Observer ${observer.constructor?.name ?? ''} lỗi khi nhận sự kiện ${event?.type}:`, err);
      }
    }
  }
}

/** Định dạng một sự kiện Server-Sent Events, trình duyệt nghe bằng addEventListener('order'). */
const toSse = (event) => `event: order\ndata: ${JSON.stringify(event)}\n\n`;

/** Gửi tới một kết nối SSE; kết nối đã đóng thì gỡ luôn để không gửi lại. */
function send(res, event, remove) {
  try {
    res.write(toSse(event));
  } catch {
    remove();
  }
}

/** Nhật ký hệ thống: lưu mọi sự kiện trong bộ nhớ (giữ tối đa MAX_LOGS bản ghi mới nhất). */
export class OrderLogObserver extends OrderObserver {
  static MAX_LOGS = 1000;

  constructor() {
    super();
    this.logs = [];
  }

  update(event) {
    this.logs.push({ ...event });
    if (this.logs.length > OrderLogObserver.MAX_LOGS) this.logs.shift();
  }

  /** Bản sao danh sách sự kiện (của một đơn nếu truyền orderId). */
  getLogs(orderId) {
    return this.logs.filter((e) => !orderId || e.orderId === orderId).map((e) => ({ ...e }));
  }
}

export class CustomerStreamObserver extends OrderObserver {
  constructor() {
    super();
    this.clients = new Map(); // orderId → Set<res>
  }

  /** Khách mở trang theo dõi đơn orderId. Trả hàm gỡ kết nối (gọi khi req 'close'). */
  addClient(orderId, res) {
    if (!this.clients.has(orderId)) this.clients.set(orderId, new Set());
    this.clients.get(orderId).add(res);
    return () => {
      const viewers = this.clients.get(orderId);
      viewers?.delete(res);
      if (viewers?.size === 0) this.clients.delete(orderId);
    };
  }

  /** Chỉ gửi cho khách đang xem đúng đơn của sự kiện. */
  update(event) {
    const viewers = this.clients.get(event.orderId);
    if (!viewers) return;
    for (const res of [...viewers]) send(res, event, () => viewers.delete(res));
  }
}

export class AdminFeedObserver extends OrderObserver {
  constructor() {
    super();
    this.clients = new Set();
  }

  /** Một màn hình admin mở luồng sự kiện. Trả hàm gỡ kết nối. */
  addClient(res) {
    this.clients.add(res);
    return () => this.clients.delete(res);
  }

  /** Màn hình admin nhận sự kiện của MỌI đơn. */
  update(event) {
    for (const res of [...this.clients]) send(res, event, () => this.clients.delete(res));
  }
}
