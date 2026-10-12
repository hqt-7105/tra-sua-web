import express from 'express';
import cors from 'cors';

import menuRoutes from './routes/menu.routes.js';
import cartRoutes from './routes/cart.routes.js';
import voucherRoutes from './routes/voucher.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { securityHeaders } from './middlewares/securityHeaders.js';

/**
 * Tạo Express app (tách khỏi index.js để test được mà không cần mở cổng cố định).
 */
export function createApp() {
  const app = express();

  app.use(securityHeaders); // B4: header bảo mật cho mọi response
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Sprint 0 (đã xong): categories, drinks, toppings, options
  app.use('/api', menuRoutes);

  // Sprint 1: mỗi route dưới đây đang trả 501, thành viên phụ trách sẽ cài đặt
  app.use('/api/cart', cartRoutes); // TV3 - Builder
  app.use('/api/vouchers', voucherRoutes); // TV4 - Strategy
  app.use('/api/orders', orderRoutes); // TV5 - State (S1), TV1 - Facade (S2), TV2 - Observer (S2)

  // Sprint 2
  app.use('/api/payments', paymentRoutes); // TV3 - Adapter
  app.use('/api/admin', adminRoutes); // TV4 - Proxy, TV5 - CoR/đơn hàng, TV2 - Observer

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
