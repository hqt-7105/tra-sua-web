/**
 * Đổi trạng thái đơn — dùng chung cho
 *   PATCH /api/orders/:id/status        (trang theo dõi đơn, nút demo — TV5 Sprint 1)
 *   PATCH /api/admin/orders/:id/status  (nhân viên xử lý đơn — TV5 Sprint 2)
 *
 * State (Order) tự quyết định thao tác có hợp lệ không (sai → 409); đổi xong thì
 * lưu và phát STATUS_CHANGED cho Observer, nên trang khách và admin tự cập nhật.
 *
 *   findOrderOr404(id)            → Order | throw HttpError(404)
 *   changeOrderStatus(id, action) → Order sau khi chuyển
 *     action ∉ ORDER_ACTIONS → HttpError(400) kèm field 'action'
 */
import { HttpError } from '../middlewares/errorHandler.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { orderEvents, orderEvent } from '../events.js';

export const ORDER_ACTIONS = ['next', 'cancel'];

export function findOrderOr404(id) {
  const order = orderRepository.findById(id);
  if (!order) throw new HttpError(404, `Không tìm thấy đơn ${id}`);
  return order;
}

export function changeOrderStatus(id, action) {
  if (!ORDER_ACTIONS.includes(action)) {
    throw Object.assign(new HttpError(400, 'Thao tác không hợp lệ, chỉ nhận "next" hoặc "cancel"'), {
      field: 'action',
    });
  }
  const order = findOrderOr404(id);
  const from = order.getStatus();
  order[action](); // sai trạng thái → InvalidTransitionError 409
  orderRepository.save(order);
  orderEvents.notify(orderEvent('STATUS_CHANGED', order, { from, to: order.getStatus() }));
  return order;
}
