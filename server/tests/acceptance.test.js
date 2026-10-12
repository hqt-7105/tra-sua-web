// Nghiệm thu — C1 (TV1): 9 tiêu chí ở docs/DAC_TA.md mục 10, mỗi tiêu chí một khối describe.
// Đi từ đầu đến cuối qua HTTP vào app thật (Factory, Builder, Decorator, Strategy, Chain, Facade,
// Adapter + SDK giả, State, Observer qua SSE, Proxy + đăng nhập), không thay hệ thống con bằng đồ giả.
// Chạy riêng: npm run test:acceptance (ở thư mục gốc). Bảng test case thủ công: docs/TEST_CASES.md.
import { describe, test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { startTestServer } from './helpers/testServer.js';

const ROOT = new URL('../../', import.meta.url);
const SHIPPING_FEE = 15000;
const CUSTOMER = { name: 'Nguyễn An', phone: '0912345678', address: '12 Nguyễn Huệ, Quận 1' };
/** Ví dụ tiêu chí 1: Trà sữa truyền thống size L, đường 50%, đá 70%, trân châu đen + pudding. */
const CUSTOM_LINE = {
  drinkId: 'ts-truyen-thong',
  size: 'L',
  sugar: 50,
  ice: 70,
  toppingIds: ['tran-chau-den', 'pudding'],
  quantity: 2,
};

let api;
const streams = [];
before(async () => {
  api = await startTestServer();
});
after(async () => {
  streams.forEach((stream) => stream.close());
  await api.close();
});
// Giờ giả lập trong giờ mở cửa; tiêu chí 7 tự đổi sang 23:00.
beforeEach(() => {
  process.env.FAKE_HOUR = '10';
});

const placeOrder = (overrides = {}) =>
  api.post('/orders', {
    customer: CUSTOMER,
    items: [{ drinkId: 'cf-den-da', quantity: 4 }],
    paymentMethod: 'COD',
    ...overrides,
  });

/** Tham số cổng giả gửi kèm link thanh toán (/payment/mock?...), như trang cổng giả đọc từ URL. */
const gatewayParams = (redirectUrl) => Object.fromEntries(new URL(redirectUrl, 'http://localhost').searchParams);

/** Mở luồng SSE như EventSource của trình duyệt; next() trả sự kiện `event: order` kế tiếp. */
async function openStream(path, headers = {}) {
  const controller = new AbortController();
  const res = await fetch(api.baseUrl + path, {
    signal: controller.signal,
    headers: { Accept: 'text/event-stream', ...headers },
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const stream = {
    res,
    close: () => controller.abort(),
    async next(timeout = 2000) {
      const deadline = setTimeout(() => controller.abort(), timeout);
      try {
        for (;;) {
          const end = buffer.indexOf('\n\n');
          if (end >= 0) {
            const block = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            if (block.startsWith('event: order\n')) return JSON.parse(block.slice(block.indexOf('data: ') + 6));
            continue;
          }
          const { value } = await reader.read();
          buffer += decoder.decode(value, { stream: true });
        }
      } finally {
        clearTimeout(deadline);
      }
    },
  };
  streams.push(stream);
  return stream;
}

describe('Tiêu chí 1: size L, đường 50%, 2 topping → giá đúng BR02', () => {
  test('server tính đơn giá = gốc + size + từng topping, tiền là số nguyên VND', async () => {
    const { status, body } = await api.post('/cart/price', CUSTOM_LINE);
    assert.equal(status, 200);
    assert.equal(body.unitPrice, 35000 + 6000 + 5000 + 7000); // 53.000đ
    assert.equal(body.totalPrice, 106000);
    assert.equal(body.size, 'L');
    assert.equal(body.sugar, 50);
    assert.deepEqual(body.toppings.map((t) => t.id), ['tran-chau-den', 'pudding']);
    assert.ok(Number.isInteger(body.unitPrice) && Number.isInteger(body.totalPrice));
  });

  test('khi đặt hàng, server tính lại đúng giá đó và bỏ qua giá trình duyệt gửi lên', async () => {
    const { status, body } = await placeOrder({ items: [{ ...CUSTOM_LINE, unitPrice: 1, totalPrice: 2 }] });
    assert.equal(status, 201);
    assert.equal(body.order.items[0].unitPrice, 53000);
    assert.equal(body.order.subtotal, 106000);
  });
});

// Gộp dòng và giữ giỏ khi tải lại là việc của CartStore (Singleton) phía trình duyệt — xem
// client/tests/cartStore.test.js ("thêm cùng key thì cộng dồn số lượng") và
// client/tests/cartStorage.test.js ("đọc lại giỏ đã lưu"), chạy bằng npm test -w client.
// Ở đây kiểm tra phần server mà việc gộp dòng dựa vào.
describe('Tiêu chí 2: cùng tổ hợp → gộp một dòng số lượng 2 (gộp và tải lại: client/tests/cartStore.test.js)', () => {
  test('cùng tổ hợp tính giá hai lần cho kết quả giống hệt, nên trình duyệt gộp được thành một dòng', async () => {
    const line = { ...CUSTOM_LINE, quantity: 1 };
    const first = await api.post('/cart/price', line);
    const second = await api.post('/cart/price', line);
    assert.equal(first.status, 200);
    assert.deepEqual(second.body, first.body);
  });

  test('dòng đã gộp (số lượng 2) đặt hàng thành một dòng, tạm tính bằng 2 lần đơn giá', async () => {
    const { body } = await placeOrder({ items: [CUSTOM_LINE] });
    assert.equal(body.order.items.length, 1);
    assert.equal(body.order.items[0].quantity, 2);
    assert.equal(body.order.subtotal, 2 * body.order.items[0].unitPrice);
  });
});

describe('Tiêu chí 3: MAY10 cho đơn 100.000đ giảm 10.000đ; mã hết hạn báo lỗi rõ ràng', () => {
  test('áp MAY10 cho tạm tính 100.000đ → giảm 10.000đ, tổng 105.000đ', async () => {
    const { status, body } = await api.post('/vouchers/validate', { code: 'MAY10', subtotal: 100000 });
    assert.equal(status, 200);
    assert.equal(body.discount, 10000);
    assert.equal(body.total, 100000 + SHIPPING_FEE - 10000);
    assert.equal(body.message, 'Giảm 10% (tối đa 20.000đ)');
  });

  test('đặt đơn 4 ly Cà phê đen đá (100.000đ) kèm MAY10 → đơn lưu đúng giảm giá và tổng', async () => {
    const { status, body } = await placeOrder({ voucherCode: 'MAY10' });
    assert.equal(status, 201);
    assert.equal(body.order.subtotal, 100000);
    assert.equal(body.order.discount, 10000);
    assert.equal(body.order.total, 105000);
  });

  test('mã hết hạn → 400 "Mã HETHAN đã hết hạn", đặt hàng với mã đó không tạo đơn', async () => {
    const { status, body } = await api.post('/vouchers/validate', { code: 'HETHAN', subtotal: 100000 });
    assert.equal(status, 400);
    assert.equal(body.error, 'Mã HETHAN đã hết hạn');

    const staff = await api.loginAs('staff');
    const before = (await api.get('/admin/orders', staff)).body.length;
    assert.equal((await placeOrder({ voucherCode: 'HETHAN' })).status, 400);
    assert.equal((await api.get('/admin/orders', staff)).body.length, before);
  });
});

describe('Tiêu chí 4: đặt COD → PENDING/UNPAID; admin nhận đơn mới không cần tải lại', () => {
  test('đơn COD ở trạng thái PENDING, thanh toán UNPAID, không chuyển sang cổng', async () => {
    const { status, body } = await placeOrder();
    assert.equal(status, 201);
    assert.equal(body.order.status, 'PENDING');
    assert.equal(body.order.paymentStatus, 'UNPAID');
    assert.equal(body.payment.redirectUrl, null);
  });

  test('luồng SSE của admin nhận ORDER_CREATED ngay khi khách đặt, đơn đứng đầu danh sách', async () => {
    const staff = await api.loginAs('staff');
    const feed = await openStream('/admin/events', staff);
    assert.equal(feed.res.status, 200);

    const { body } = await placeOrder();
    const event = await feed.next();
    assert.equal(event.type, 'ORDER_CREATED');
    assert.equal(event.orderId, body.order.id);

    const list = await api.get('/admin/orders?status=PENDING', staff);
    assert.equal(list.body[0].id, body.order.id);
  });
});

describe('Tiêu chí 5: nhân viên xác nhận → trang khách tự đổi; hủy đơn đang giao bị từ chối', () => {
  test('nhân viên bấm Xác nhận → luồng SSE của khách nhận STATUS_CHANGED sang PREPARING', async () => {
    const { body } = await placeOrder();
    const id = body.order.id;
    const customer = await openStream(`/orders/${id}/events`);
    assert.equal(customer.res.status, 200);

    const staff = await api.loginAs('staff');
    const confirmed = await api.patch(`/admin/orders/${id}/status`, { action: 'next' }, staff);
    assert.equal(confirmed.status, 200);
    const event = await customer.next();
    assert.equal(event.type, 'STATUS_CHANGED');
    assert.equal(event.orderId, id);
    assert.equal(event.from, 'PENDING');
    assert.equal(event.to, 'PREPARING');
    assert.equal((await api.get(`/orders/${id}`)).body.status, 'PREPARING');
  });

  test('hủy đơn đang giao → 409, đơn vẫn DELIVERING', async () => {
    const { body } = await placeOrder();
    const id = body.order.id;
    const staff = await api.loginAs('staff');
    await api.patch(`/admin/orders/${id}/status`, { action: 'next' }, staff);
    await api.patch(`/admin/orders/${id}/status`, { action: 'next' }, staff);

    const { status, body: error } = await api.patch(`/admin/orders/${id}/status`, { action: 'cancel' }, staff);
    assert.equal(status, 409);
    assert.equal(error.error, 'Không thể hủy đơn khi đơn đang ở trạng thái "Đang giao"');
    const order = (await api.get(`/orders/${id}`)).body;
    assert.equal(order.status, 'DELIVERING');
    assert.deepEqual(order.allowedActions, ['next']);
  });
});

describe('Tiêu chí 6: MoMo thanh toán thành công → PAID; VNPay hủy → CANCELLED', () => {
  test('đặt MoMo → cổng giả báo thành công → PAID, đơn vẫn chờ xác nhận', async () => {
    const { status, body } = await placeOrder({ paymentMethod: 'MOMO' });
    assert.equal(status, 201);
    assert.equal(body.order.paymentStatus, 'PENDING');
    const params = gatewayParams(body.payment.redirectUrl);
    assert.equal(params.gateway, 'momo');

    const confirmed = await api.post('/payments/confirm', { gateway: 'momo', params: { ...params, resultCode: '0' } });
    assert.equal(confirmed.status, 200);
    assert.deepEqual(confirmed.body, { orderId: body.order.id, status: 'PENDING', paymentStatus: 'PAID' });
  });

  test('đặt VNPay → khách hủy giao dịch → đơn CANCELLED, thanh toán FAILED', async () => {
    const { body } = await placeOrder({ paymentMethod: 'VNPAY' });
    const params = gatewayParams(body.payment.redirectUrl);
    assert.equal(params.vnp_Amount, String(body.order.total * 100));

    const cancelled = await api.post('/payments/confirm', { gateway: 'vnpay', params: { ...params, vnp_ResponseCode: '24' } });
    assert.equal(cancelled.status, 200);
    assert.deepEqual(cancelled.body, { orderId: body.order.id, status: 'CANCELLED', paymentStatus: 'FAILED' });
  });
});

describe('Tiêu chí 7: SĐT sai → lỗi đúng ô; đặt lúc 23:00 → báo cửa hàng đóng cửa', () => {
  test('SĐT sai → 400 với field "customer.phone" (trang Đặt hàng hiện lỗi dưới ô Số điện thoại)', async () => {
    const { status, body } = await placeOrder({ customer: { ...CUSTOMER, phone: '0123456789' } });
    assert.equal(status, 400);
    assert.equal(body.field, 'customer.phone');
    assert.match(body.error, /^Số điện thoại không hợp lệ/);
  });

  test('giờ giả lập 23:00 → 400 field "store", thông báo đóng cửa, không tạo đơn', async () => {
    const staff = await api.loginAs('staff');
    const before = (await api.get('/admin/orders', staff)).body.length;
    process.env.FAKE_HOUR = '23';
    const { status, body } = await placeOrder();
    assert.equal(status, 400);
    assert.equal(body.field, 'store');
    assert.match(body.error, /^Cửa hàng đang đóng cửa, chỉ nhận đơn từ 08:00 đến 22:00/);
    assert.equal((await api.get('/admin/orders', staff)).body.length, before);
  });
});

describe('Tiêu chí 8: nhân viên sửa giá → 403; admin sửa được, nhật ký ghi lại', () => {
  const DRINK = '/admin/drinks/ts-o-long';
  let originalPrice;
  before(async () => {
    originalPrice = (await api.get('/drinks/ts-o-long')).body.basePrice;
  });
  after(async () => {
    await api.put(DRINK, { basePrice: originalPrice }, await api.loginAs('admin'));
  });

  test('nhân viên sửa giá → 403, giá không đổi, nhật ký không có dòng mới', async () => {
    const admin = await api.loginAs('admin');
    const logBefore = (await api.get('/admin/audit-log', admin)).body.length;

    const { status, body } = await api.put(DRINK, { basePrice: originalPrice + 1000 }, await api.loginAs('staff'));
    assert.equal(status, 403);
    assert.equal(body.error, 'Bạn không có quyền thực hiện thao tác này');
    assert.equal((await api.get('/drinks/ts-o-long')).body.basePrice, originalPrice);
    assert.equal((await api.get('/admin/audit-log', admin)).body.length, logBefore);
  });

  test('admin sửa giá → 200, menu khách thấy giá mới, nhật ký ghi email + hành động + món', async () => {
    const admin = await api.loginAs('admin');
    const newPrice = originalPrice + 1000;
    const { status, body } = await api.put(DRINK, { basePrice: newPrice }, admin);
    assert.equal(status, 200);
    assert.equal(body.basePrice, newPrice);
    assert.equal((await api.get('/drinks/ts-o-long')).body.basePrice, newPrice);

    const [latest] = (await api.get('/admin/audit-log', admin)).body;
    assert.equal(latest.email, 'admin@may.vn');
    assert.equal(latest.action, 'updateDrink');
    assert.equal(latest.targetId, 'ts-o-long');
    assert.ok(latest.at);
  });
});

describe('Tiêu chí 9: không còn test todo; đủ 11 pattern có tài liệu và khối chú thích GoF', () => {
  const PATTERNS = {
    singleton: 'client/src/store/cartStore.js',
    'factory-method': 'server/src/patterns/creational/DrinkFactory.js',
    builder: 'server/src/patterns/creational/OrderItemBuilder.js',
    decorator: 'server/src/patterns/structural/ToppingDecorator.js',
    adapter: 'server/src/patterns/structural/PaymentAdapter.js',
    facade: 'server/src/patterns/structural/OrderFacade.js',
    proxy: 'server/src/patterns/structural/MenuServiceProxy.js',
    strategy: 'server/src/patterns/behavioral/DiscountStrategy.js',
    state: 'server/src/patterns/behavioral/OrderState.js',
    observer: 'server/src/patterns/behavioral/OrderEvents.js',
    'chain-of-responsibility': 'server/src/patterns/behavioral/OrderValidation.js',
  };
  const read = (path) => readFileSync(new URL(path, ROOT), 'utf-8');

  test('mỗi pattern có docs/patterns/<ten>.md', () => {
    const missing = Object.keys(PATTERNS).filter((name) => !existsSync(new URL(`docs/patterns/${name}.md`, ROOT)));
    assert.deepEqual(missing, []);
  });

  test('file cài pattern có đủ Vấn đề / Giải pháp / Cấu trúc GoF / Ví dụ (QUY_UOC mục 4)', () => {
    for (const [name, file] of Object.entries(PATTERNS)) {
      const header = read(file).slice(0, 4000);
      for (const heading of ['Vấn đề', 'Giải pháp', 'Cấu trúc GoF', 'Ví dụ']) {
        assert.ok(header.includes(heading), `${name} (${file}) thiếu "${heading}"`);
      }
    }
  });

  test('không còn test đánh dấu todo ở server/tests và client/tests', () => {
    const todo = new RegExp(String.raw`\{\s*todo\s*:|\.todo\(`);
    const marked = ['server/tests/', 'client/tests/'].flatMap((dir) =>
      readdirSync(new URL(dir, ROOT))
        .filter((file) => file.endsWith('.test.js'))
        .filter((file) => todo.test(read(dir + file)))
        .map((file) => dir + file),
    );
    assert.deepEqual(marked, []);
  });
});
