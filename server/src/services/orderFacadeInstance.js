/**
 * OrderFacade nối với các hệ thống con THẬT — PHỤ TRÁCH: TV1 (Sprint 2).
 * Route POST /api/orders chỉ gọi orderFacade.placeOrder(req.body).
 *
 *   validator             ← buildOrderValidationChain (Chain of Responsibility, TV5)
 *   createItem            ← createOrderItem (Director của Builder + Factory Method + Decorator, TV3)
 *   voucherService        ← Strategy (TV4)
 *   paymentGatewayFactory ← createPaymentGateway (Adapter, TV3)
 *   orderRepository       ← lưu đơn (State, TV5)
 *   orderEvents           ← Subject của Observer (TV2)
 *
 * Giờ giả lập (DAC_TA mục 10, tiêu chí 7 — thử "cửa hàng đóng cửa"):
 *   FAKE_HOUR=23 npm run dev          (PowerShell: $env:FAKE_HOUR=23; npm run dev)
 *   Không đặt FAKE_HOUR → dùng giờ Việt Nam thật.
 */
import { config } from '../config.js';
import { orderEvents } from '../events.js';
import { OrderFacade } from '../patterns/structural/OrderFacade.js';
import { createPaymentGateway } from '../patterns/structural/PaymentAdapter.js';
import {
  buildOrderValidationChain,
  currentHourInVietnam,
} from '../patterns/behavioral/OrderValidation.js';
import { menuRepository } from '../repositories/menuRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { createOrderItem } from './orderItemService.js';
import { voucherService } from './voucherService.js';

/** Giờ hiện tại (0-23) cho kiểm tra giờ mở cửa; đọc FAKE_HOUR mỗi lần gọi để test đổi được. */
export function storeClock() {
  const fake = process.env.FAKE_HOUR;
  if (fake !== undefined && fake !== '') {
    const hour = Number(fake);
    if (Number.isInteger(hour) && hour >= 0 && hour <= 23) return hour;
  }
  return currentHourInVietnam();
}

export const orderFacade = new OrderFacade({
  validator: buildOrderValidationChain({ menuRepository, clock: storeClock }),
  createItem: createOrderItem,
  voucherService,
  paymentGatewayFactory: createPaymentGateway,
  orderRepository,
  orderEvents,
  config,
});
