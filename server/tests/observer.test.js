// Observer — TV2 (Sprint 2). Test chấp nhận đã bật toàn bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OrderSubject,
  OrderObserver,
  OrderLogObserver,
  CustomerStreamObserver,
  AdminFeedObserver,
} from '../src/patterns/behavioral/OrderEvents.js';

const event = (orderId, type = 'STATUS_CHANGED') => ({
  type,
  orderId,
  status: 'PREPARING',
  from: 'PENDING',
  to: 'PREPARING',
  at: '2026-10-26T03:00:00.000Z',
});

class Spy extends OrderObserver {
  constructor(name, calls) {
    super();
    this.name = name;
    this.calls = calls;
  }

  update(e) {
    this.calls.push(`${this.name}:${e.orderId}`);
  }
}

const fakeResponse = () => ({
  chunks: [],
  write(chunk) {
    this.chunks.push(chunk);
  },
});

test('notify gọi mọi observer theo thứ tự đăng ký', () => {
  const calls = [];
  const subject = new OrderSubject();
  subject.attach(new Spy('a', calls));
  subject.attach(new Spy('b', calls));
  subject.notify(event('DH1'));
  assert.deepEqual(calls, ['a:DH1', 'b:DH1']);
});

test('đăng ký trùng thì chỉ nhận một lần; detach thì thôi nhận', () => {
  const calls = [];
  const subject = new OrderSubject();
  const spy = new Spy('a', calls);
  subject.attach(spy);
  subject.attach(spy);
  subject.notify(event('DH1'));
  subject.detach(spy);
  subject.notify(event('DH2'));
  assert.deepEqual(calls, ['a:DH1']);
});

test('một observer lỗi không làm hỏng các observer khác', (t) => {
  t.mock.method(console, 'error', () => {});
  const calls = [];
  const subject = new OrderSubject();
  subject.attach({ update: () => { throw new Error('hỏng'); } });
  subject.attach(new Spy('b', calls));
  assert.doesNotThrow(() => subject.notify(event('DH1')));
  assert.deepEqual(calls, ['b:DH1']);
});

test('OrderLogObserver lưu sự kiện, lọc theo đơn, trả bản sao', () => {
  const log = new OrderLogObserver();
  log.update(event('DH1'));
  log.update(event('DH2'));
  log.update(event('DH1', 'PAYMENT_UPDATED'));
  assert.equal(log.getLogs().length, 3);
  assert.equal(log.getLogs('DH1').length, 2);
  log.getLogs().pop();
  assert.equal(log.getLogs().length, 3);
});

test('CustomerStreamObserver chỉ gửi SSE cho khách đang xem đúng đơn', () => {
  const stream = new CustomerStreamObserver();
  const resA = fakeResponse();
  const resB = fakeResponse();
  const removeA = stream.addClient('DH1', resA);
  stream.addClient('DH2', resB);

  stream.update(event('DH1'));
  assert.equal(resA.chunks.length, 1);
  assert.equal(resB.chunks.length, 0);
  assert.equal(resA.chunks[0], `event: order\ndata: ${JSON.stringify(event('DH1'))}\n\n`);

  removeA();
  stream.update(event('DH1'));
  assert.equal(resA.chunks.length, 1);
});

test('AdminFeedObserver gửi cho tất cả màn hình admin', () => {
  const feed = new AdminFeedObserver();
  const res1 = fakeResponse();
  const res2 = fakeResponse();
  feed.addClient(res1);
  const remove2 = feed.addClient(res2);
  feed.update(event('DH1'));
  remove2();
  feed.update(event('DH2'));
  assert.equal(res1.chunks.length, 2);
  assert.equal(res2.chunks.length, 1);
});
