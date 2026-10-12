/**
 * Instance Observer dùng chung cho cả server — PHỤ TRÁCH: TV2 (Sprint 2).
 *
 * Ai phát sự kiện:
 *   - OrderFacade (TV1)                     → ORDER_CREATED
 *   - PATCH /api/orders/:id/status (TV5)    → STATUS_CHANGED
 *   - PATCH /api/admin/orders/:id/status    → STATUS_CHANGED
 *   - POST /api/payments/confirm (TV3)      → PAYMENT_UPDATED
 *
 * Ai nhận: nhật ký (orderLog), khách đang xem đơn (customerStream), màn hình admin (adminFeed).
 */
import {
  OrderSubject,
  OrderLogObserver,
  CustomerStreamObserver,
  AdminFeedObserver,
} from './patterns/behavioral/OrderEvents.js';

export const orderEvents = new OrderSubject();
export const orderLog = new OrderLogObserver();
export const customerStream = new CustomerStreamObserver();
export const adminFeed = new AdminFeedObserver();

orderEvents.attach(orderLog);
orderEvents.attach(customerStream);
orderEvents.attach(adminFeed);

/**
 * Dựng sự kiện từ đơn hàng theo đúng định dạng trong OrderEvents.js.
 *   orderEvents.notify(orderEvent('STATUS_CHANGED', order, { from: 'PENDING', to: 'PREPARING' }))
 */
export const orderEvent = (type, order, extra = {}) => ({
  type,
  orderId: order.id,
  status: order.getStatus(),
  paymentStatus: order.paymentStatus,
  ...extra,
  at: new Date().toISOString(),
});
