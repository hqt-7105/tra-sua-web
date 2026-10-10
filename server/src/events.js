/**
 * Instance Observer dùng chung cho cả server — PHỤ TRÁCH: TV2 (Sprint 2).
 *
 * Ai phát sự kiện:
 *   - OrderFacade (TV1)                     → ORDER_CREATED
 *   - PATCH /api/orders/:id/status (TV5)    → STATUS_CHANGED
 *   - PATCH /api/admin/orders/:id/status    → STATUS_CHANGED
 *   - POST /api/payments/confirm (TV3)      → PAYMENT_UPDATED
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

// TODO(TV2): bỏ comment khi đã cài attach()
// orderEvents.attach(orderLog);
// orderEvents.attach(customerStream);
// orderEvents.attach(adminFeed);
