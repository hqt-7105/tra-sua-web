// Observer qua API — TV2 (Sprint 2): luồng SSE của khách và admin, nơi phát sự kiện.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { orderLog } from '../src/events.js';
import { orderRepository } from '../src/repositories/orderRepository.js';
import { Order } from '../src/patterns/behavioral/OrderState.js';
import { MomoAdapter } from '../src/patterns/structural/PaymentAdapter.js';

let api;
const streams = [];
before(async () => {
  api = await startTestServer();
});
after(async () => {
  streams.forEach((stream) => stream.close());
  await api.close();
});

/** Mở luồng SSE, next() trả sự kiện `event: order` kế tiếp (bỏ qua retry/ping). */
async function openStream(path) {
  const controller = new AbortController();
  const res = await fetch(api.baseUrl + path, { signal: controller.signal });
  const reader = res.body?.getReader();
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

test('GET /orders/:id/events mở luồng SSE, đổi trạng thái thì khách nhận STATUS_CHANGED', async () => {
  const stream = await openStream('/orders/DH001/events');
  assert.equal(stream.res.status, 200);
  assert.match(stream.res.headers.get('content-type'), /text\/event-stream/);

  const patched = await api.patch('/orders/DH001/status', { action: 'next' });
  assert.equal(patched.status, 200);
  const event = await stream.next();
  assert.equal(event.type, 'STATUS_CHANGED');
  assert.equal(event.orderId, 'DH001');
  assert.equal(event.from, 'PENDING');
  assert.equal(event.to, 'PREPARING');
  assert.equal(event.status, 'PREPARING');
  assert.ok(event.at);
});

test('GET /orders/:id/events với đơn không có trả 404', async () => {
  const { status, body } = await api.get('/orders/DH999/events');
  assert.equal(status, 404);
  assert.match(body.error, /Không tìm thấy đơn/);
});

test('GET /admin/events nhận sự kiện của mọi đơn, kể cả PAYMENT_UPDATED', async () => {
  const feed = await openStream('/admin/events');
  assert.equal(feed.res.status, 200);

  const order = orderRepository.save(
    new Order({ id: orderRepository.nextId(), total: 47000, paymentMethod: 'MOMO', paymentStatus: 'PENDING' }),
  );
  const payment = await new MomoAdapter().pay(order);
  const params = Object.fromEntries(new URL(payment.redirectUrl, 'http://x').searchParams);
  await api.post('/payments/confirm', { gateway: 'momo', params: { ...params, resultCode: '0' } });

  const event = await feed.next();
  assert.equal(event.type, 'PAYMENT_UPDATED');
  assert.equal(event.orderId, order.id);
  assert.equal(event.paymentStatus, 'PAID');
});

test('đổi trạng thái sai (409) thì không phát sự kiện; nhật ký lưu sự kiện đã phát', async () => {
  const before = orderLog.getLogs('DH002').length;
  const { status } = await api.patch('/orders/DH002/status', { action: 'cancel' });
  assert.equal(status, 409);
  assert.equal(orderLog.getLogs('DH002').length, before);
  assert.ok(orderLog.getLogs('DH001').some((e) => e.type === 'STATUS_CHANGED'));
});
