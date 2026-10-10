/**
 * Repository đơn hàng — PHỤ TRÁCH: TV5 (Sprint 1)              [CHƯA LÀM]
 *
 * Sprint 1-2 lưu trong bộ nhớ (Map). Sprint 3 chuyển sang CSDL thật, chỉ cần
 * viết lại file này, các phần khác không phải sửa.
 *
 * Hợp đồng (Sprint 2: OrderFacade của TV1 và trang Admin của TV5 sẽ gọi):
 *   orderRepository.nextId()         → 'DH004', 'DH005', ... (không trùng)
 *   orderRepository.save(order)      → lưu/ghi đè Order (instance của lớp Order), trả về order
 *   orderRepository.findById(id)     → Order | null
 *   orderRepository.findAll({ status }) → Order[] mới nhất trước, lọc theo status nếu có
 *
 * Seed sẵn: DH001 (PENDING), DH002 (DELIVERING), DH003 (CANCELLED)
 */
// import { Order } from '../patterns/behavioral/OrderState.js';

const todo = (method) => {
  throw new Error(`TODO(TV5): chưa cài orderRepository.${method}()`);
};

export const orderRepository = {
  nextId: () => todo('nextId'),
  // eslint-disable-next-line no-unused-vars
  save: (order) => todo('save'),
  // eslint-disable-next-line no-unused-vars
  findById: (id) => todo('findById'),
  // eslint-disable-next-line no-unused-vars
  findAll: (filter) => todo('findAll'),
};
