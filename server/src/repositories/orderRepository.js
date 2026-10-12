/**
 * Repository đơn hàng — PHỤ TRÁCH: TV5 (Sprint 1)
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
import { Order } from '../patterns/behavioral/OrderState.js';

const ID_PREFIX = 'DH';
const orders = new Map();
let lastNumber = 0;

const numberOf = (id) => Number(String(id).slice(ID_PREFIX.length)) || 0;

/** Dòng món mẫu, cùng dạng OrderItem.toJSON() (giá là bản chụp lúc đặt, BR23). */
const line = ({ drinkId, drinkName, size = 'M', sugar = 100, ice = 100, toppings = [], quantity = 1, basePrice }) => {
  const sizeExtra = size === 'L' ? 6000 : 0;
  const unitPrice = basePrice + sizeExtra + toppings.reduce((sum, t) => sum + t.price, 0);
  return {
    drinkId,
    drinkName,
    description: [drinkName, ...toppings.map((t) => t.name)].join(' + '),
    size,
    sugar,
    ice,
    toppings,
    quantity,
    note: '',
    unitPrice,
    totalPrice: unitPrice * quantity,
  };
};

function seed() {
  const pearl = { id: 'tran-chau-den', name: 'Trân châu đen', price: 5000 };
  const cheese = { id: 'kem-cheese', name: 'Kem cheese', price: 10000 };

  const dh001Items = [
    line({ drinkId: 'ts-truyen-thong', drinkName: 'Trà sữa truyền thống', basePrice: 35000, toppings: [pearl] }),
  ];
  const dh001 = new Order({
    id: 'DH001',
    customerName: 'Nguyễn An',
    phone: '0912345678',
    address: '12 Nguyễn Huệ, Quận 1, TP.HCM',
    items: dh001Items,
    subtotal: 40000,
    shippingFee: 15000,
    total: 55000,
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    createdAt: new Date('2026-10-10T02:00:00.000Z'),
  });

  const dh002Items = [
    line({ drinkId: 'ttc-dao', drinkName: 'Trà đào cam sả', basePrice: 39000, size: 'L', sugar: 70, quantity: 2 }),
    line({ drinkId: 'cf-muoi', drinkName: 'Cà phê muối', basePrice: 35000, sugar: 50 }),
  ];
  const dh002 = new Order({
    id: 'DH002',
    customerName: 'Trần Bình',
    phone: '0987654321',
    address: '45 Lê Lợi, Quận 1, TP.HCM',
    note: 'Gọi trước khi giao',
    items: dh002Items,
    subtotal: 125000,
    shippingFee: 15000,
    discount: 12500,
    total: 127500,
    voucherCode: 'MAY10',
    paymentMethod: 'MOMO',
    paymentStatus: 'PAID',
    createdAt: new Date('2026-10-10T03:00:00.000Z'),
  });
  dh002.next().next(); // PENDING → PREPARING → DELIVERING

  const dh003Items = [
    line({ drinkId: 'dx-socola', drinkName: 'Socola đá xay', basePrice: 49000, toppings: [cheese] }),
  ];
  const dh003 = new Order({
    id: 'DH003',
    customerName: 'Lê Chi',
    phone: '0356789012',
    address: '8 Võ Văn Tần, Quận 3, TP.HCM',
    items: dh003Items,
    subtotal: 59000,
    shippingFee: 15000,
    total: 74000,
    paymentMethod: 'VNPAY',
    paymentStatus: 'FAILED',
    createdAt: new Date('2026-10-10T04:00:00.000Z'),
  });
  dh003.cancel(); // khách hủy giao dịch VNPay → đơn bị hủy (BR17)

  [dh001, dh002, dh003].forEach((order) => orderRepository.save(order));
}

export const orderRepository = {
  nextId() {
    lastNumber += 1;
    return `${ID_PREFIX}${String(lastNumber).padStart(3, '0')}`;
  },

  save(order) {
    if (!(order instanceof Order)) {
      throw new TypeError('orderRepository.save() chỉ nhận đối tượng Order');
    }
    orders.set(order.id, order);
    lastNumber = Math.max(lastNumber, numberOf(order.id));
    return order;
  },

  findById(id) {
    return orders.get(id) ?? null;
  },

  findAll({ status } = {}) {
    return [...orders.values()]
      .filter((order) => !status || order.getStatus() === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || numberOf(b.id) - numberOf(a.id));
  },
};

seed();
