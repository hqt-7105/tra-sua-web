// Bảo mật — TV4 (B4): header bảo mật, giới hạn tần suất (rateLimit), chặn dò mật khẩu đăng nhập.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { startTestServer } from './helpers/testServer.js';
import { rateLimit } from '../src/middlewares/rateLimit.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

/** Gọi middleware với req/res giả, trả lỗi (nếu có) mà middleware chuyển cho next(). */
function run(middleware, ip = '1.2.3.4', statusCode = 200) {
  const res = Object.assign(new EventEmitter(), { statusCode, headers: {}, set(k, v) { this.headers[k] = v; } });
  let error;
  middleware({ ip }, res, (err) => {
    error = err;
  });
  res.emit('finish');
  return { error, res };
}

test('mọi response có header bảo mật, không lộ X-Powered-By', async () => {
  for (const path of ['/health', '/khong-co-route', '/admin/me']) {
    const { headers } = await api.get(path);
    assert.equal(headers.get('x-content-type-options'), 'nosniff', path);
    assert.equal(headers.get('x-frame-options'), 'DENY', path);
    assert.equal(headers.get('referrer-policy'), 'no-referrer', path);
    assert.equal(headers.get('x-powered-by'), null, path);
  }
});

test('rateLimit: request thứ max + 1 nhận 429 kèm Retry-After và thông báo tiếng Việt', () => {
  let time = 0;
  const limiter = rateLimit({ windowMs: 1000, max: 3, now: () => time });
  for (let i = 0; i < 3; i++) assert.equal(run(limiter).error, undefined);
  const { error, res } = run(limiter);
  assert.equal(error.status, 429);
  assert.match(error.message, /thử lại/);
  assert.equal(res.headers['Retry-After'], '1');
  assert.equal(run(limiter, '5.6.7.8').error, undefined, 'IP khác không bị ảnh hưởng');
});

test('rateLimit: hết cửa sổ thời gian thì dùng lại được, bản ghi cũ được dọn', () => {
  let time = 0;
  const limiter = rateLimit({ windowMs: 1000, max: 1, now: () => time });
  run(limiter, 'a');
  run(limiter, 'b');
  assert.equal(run(limiter, 'a').error?.status, 429);
  assert.equal(limiter.size(), 2);

  time = 1000;
  assert.equal(run(limiter, 'a').error, undefined);
  assert.equal(limiter.size(), 1, 'IP b đã hết hạn nên bị xóa khỏi Map');
});

test('rateLimit skipSuccessfulRequests: chỉ đếm request lỗi', () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 2, skipSuccessfulRequests: true });
  for (let i = 0; i < 5; i++) assert.equal(run(limiter, 'ok', 200).error, undefined);
  run(limiter, 'bad', 401);
  run(limiter, 'bad', 401);
  assert.equal(run(limiter, 'bad', 401).error?.status, 429);
});

test('rateLimit báo lỗi cấu hình sai', () => {
  assert.throws(() => rateLimit({ windowMs: 0, max: 5 }), TypeError);
  assert.throws(() => rateLimit({ windowMs: 1000 }), TypeError);
});

test('POST /admin/login: đăng nhập đúng không bị giới hạn; sai 5 lần/phút thì lần 6 bị 429', async () => {
  for (let i = 0; i < 6; i++) {
    assert.equal((await api.post('/admin/login', { email: 'staff@may.vn', password: 'staff123' })).status, 200);
  }
  for (let i = 0; i < 5; i++) {
    assert.equal((await api.post('/admin/login', { email: 'admin@may.vn', password: 'sai' })).status, 401);
  }
  const blocked = await api.post('/admin/login', { email: 'admin@may.vn', password: 'admin123' });
  assert.equal(blocked.status, 429);
  assert.match(blocked.body.error, /quá nhiều lần/);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
});
