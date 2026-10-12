/**
 * ============================================================================
 * PATTERN: State (Behavioral) — PHỤ TRÁCH: TV5
 * ============================================================================
 * Vấn đề:
 *   Đơn hàng đi qua nhiều trạng thái, mỗi trạng thái chỉ cho phép một số thao
 *   tác. Viết if (status === ...) rải rác khắp nơi rất dễ sai và khó mở rộng.
 *
 * Giải pháp:
 *   Mỗi trạng thái là một lớp ConcreteState. Order (Context) không tự kiểm tra
 *   trạng thái mà ủy quyền next()/cancel()/allowedActions() cho State hiện tại.
 *   State tự quyết định chuyển sang State nào bằng order.setState(...). Thao
 *   tác không hợp lệ rơi vào hành vi mặc định của OrderState: ném
 *   InvalidTransitionError (409). Thêm trạng thái mới = thêm một lớp.
 *
 * Vòng đời:
 *   PENDING ──next──▶ PREPARING ──next──▶ DELIVERING ──next──▶ COMPLETED
 *      │                  │
 *      └──cancel──────────┴──────────────▶ CANCELLED
 *   Không được: cancel khi DELIVERING/COMPLETED; next khi COMPLETED/CANCELLED.
 *
 * Cấu trúc GoF:
 *   Context        = Order
 *   State          = OrderState
 *   ConcreteState  = PendingState, PreparingState, DeliveringState,
 *                    CompletedState, CancelledState
 *
 * Hợp đồng / Ví dụ:
 *   const order = new Order({ id: 'DH001', customerName: 'An', total: 47000 });
 *   order.getStatus()          // 'PENDING'
 *   order.next()               // → 'PREPARING'
 *   order.cancel()             // → 'CANCELLED'
 *   order.getAllowedActions()  // ví dụ ['next', 'cancel']
 *   order.history              // [{ from, to, at }] mỗi lần chuyển trạng thái
 *   Chuyển không hợp lệ → throw InvalidTransitionError (route trả 409)
 *
 * Test chấp nhận: tests/state.test.js
 * ============================================================================
 */

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  PREPARING: 'Đang pha chế',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};
const ACTION_LABELS = { next: 'chuyển sang bước tiếp theo', cancel: 'hủy đơn' };

export class InvalidTransitionError extends Error {
  constructor(from, action) {
    super(
      `Không thể ${ACTION_LABELS[action] ?? action} khi đơn đang ở trạng thái "${STATUS_LABELS[from] ?? from}"`,
    );
    this.status = 409;
  }
}

/** State trừu tượng: mặc định từ chối mọi thao tác, lớp con override cái nào được phép. */
export class OrderState {
  /** @returns {string} ví dụ 'PENDING' */
  get name() {
    throw new Error(`${this.constructor.name} phải khai báo name`);
  }

  next(order) {
    throw new InvalidTransitionError(order.getStatus(), 'next');
  }

  cancel(order) {
    throw new InvalidTransitionError(order.getStatus(), 'cancel');
  }

  allowedActions() {
    return [];
  }
}

/** Chờ xác nhận: được xác nhận (→ PREPARING). */
export class PendingState extends OrderState {
  get name() {
    return 'PENDING';
  }

  next(order) {
    order.setState(new PreparingState());
  }

  cancel(order) {
    order.setState(new CancelledState());
  }

  allowedActions() {
    return ['next', 'cancel'];
  }
}

/** Đang pha chế: được giao hàng (→ DELIVERING) hoặc hủy. */
export class PreparingState extends OrderState {
  get name() {
    return 'PREPARING';
  }

  next(order) {
    order.setState(new DeliveringState());
  }

  cancel(order) {
    order.setState(new CancelledState());
  }

  allowedActions() {
    return ['next', 'cancel'];
  }
}

/** Đang giao: chỉ được hoàn thành (→ COMPLETED), không hủy được nữa. */
export class DeliveringState extends OrderState {
  get name() {
    return 'DELIVERING';
  }

  next(order) {
    order.setState(new CompletedState());
  }

  allowedActions() {
    return ['next'];
  }
}

/** Hoàn thành: trạng thái cuối, mọi thao tác bị từ chối (dùng mặc định của OrderState). */
export class CompletedState extends OrderState {
  get name() {
    return 'COMPLETED';
  }
}

/** Đã hủy: trạng thái cuối, mọi thao tác bị từ chối. */
export class CancelledState extends OrderState {
  get name() {
    return 'CANCELLED';
  }
}

/** Context */
export class Order {
  /**
   * Các trường thông tin đơn (đủ cho Sprint 2 - Facade). Tiền là số nguyên VND.
   * paymentStatus: 'UNPAID' (COD, chưa thu) | 'PENDING' (chờ cổng online) | 'PAID' | 'FAILED'
   */
  constructor({
    id,
    customerName = '',
    phone = '',
    address = '',
    note = '',
    items = [],
    subtotal = 0,
    shippingFee = 0,
    discount = 0,
    total = 0,
    voucherCode = null,
    paymentMethod = 'COD',
    paymentStatus = 'UNPAID',
    createdAt = new Date(),
  }) {
    this.id = id;
    this.customerName = customerName;
    this.phone = phone;
    this.address = address;
    this.note = note;
    this.items = items;
    this.subtotal = subtotal;
    this.shippingFee = shippingFee;
    this.discount = discount;
    this.total = total;
    this.voucherCode = voucherCode;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.createdAt = createdAt;
    this.state = new PendingState();
    this.history = [];
  }

  getStatus() {
    return this.state.name;
  }

  /** Chỉ các State gọi hàm này. Mỗi lần chuyển ghi lịch sử { from, to, at } (BR15). */
  setState(state) {
    this.history.push({ from: this.state.name, to: state.name, at: new Date().toISOString() });
    this.state = state;
  }

  next() {
    this.state.next(this);
    return this;
  }

  cancel() {
    this.state.cancel(this);
    return this;
  }

  getAllowedActions() {
    return this.state.allowedActions();
  }

  toJSON() {
    return {
      id: this.id,
      customerName: this.customerName,
      phone: this.phone,
      address: this.address,
      note: this.note,
      items: this.items,
      subtotal: this.subtotal,
      shippingFee: this.shippingFee,
      discount: this.discount,
      total: this.total,
      voucherCode: this.voucherCode,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      createdAt: this.createdAt,
      status: this.getStatus(),
      allowedActions: this.getAllowedActions(),
      history: this.history,
    };
  }
}
