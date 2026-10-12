// Đăng nhập & phân quyền — TV4 (Sprint 2): authService, requireAuth, /api/admin/login|logout|me.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, DEMO_ACCOUNTS } from './helpers/testServer.js';
import { authService } from '../src/services/authService.js';
import { config } from '../src/config.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

test('đăng nhập đúng trả token 64 ký tự hex và thông tin người dùng (không có hash)', async () => {
  const { status, body } = await api.post('/admin/login', DEMO_ACCOUNTS.admin);
  assert.equal(status, 200);
  assert.match(body.token, /^[0-9a-f]{64}$/);
  assert.deepEqual(body.user, { id: 1, email: 'admin@may.vn', name: 'Quản trị viên', role: 'admin' });
});

test('sai mật khẩu hay sai email đều trả cùng một thông báo 401 (BR21)', async () => {
  const wrongPassword = await api.post('/admin/login', { email: 'admin@may.vn', password: 'sai-mat-khau' });
  const wrongEmail = await api.post('/admin/login', { email: 'khong-co@may.vn', password: 'admin123' });
  const empty = await api.post('/admin/login', {});
  for (const res of [wrongPassword, wrongEmail, empty]) {
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Email hoặc mật khẩu không đúng');
  }
});

test('email không phân biệt hoa thường', async () => {
  const { status } = await api.post('/admin/login', { email: '  Staff@May.vn ', password: 'staff123' });
  assert.equal(status, 200);
});

test('GET /admin/me: có token trả người dùng, không token hoặc token lạ trả 401', async () => {
  const headers = await api.loginAs('staff');
  const me = await api.get('/admin/me', headers);
  assert.equal(me.status, 200);
  assert.equal(me.body.role, 'staff');
  assert.equal((await api.get('/admin/me')).status, 401);
  assert.equal((await api.get('/admin/me', { Authorization: 'Bearer abc' })).status, 401);
  assert.equal((await api.get('/admin/me')).body.error, 'Vui lòng đăng nhập');
});

test('đăng xuất thì token hết hiệu lực', async () => {
  const headers = await api.loginAs('admin');
  assert.equal((await api.post('/admin/logout', undefined, headers)).status, 204);
  assert.equal((await api.get('/admin/me', headers)).status, 401);
});

test('nhân viên vào route chỉ dành cho admin bị 403', async () => {
  const { status, body } = await api.get('/admin/audit-log', await api.loginAs('staff'));
  assert.equal(status, 403);
  assert.equal(body.error, 'Bạn không có quyền thực hiện thao tác này');
});

test('phiên hết hạn sau config.sessionHours (BR21)', () => {
  const now = Date.now();
  const { token } = authService.login('admin@may.vn', 'admin123', now);
  assert.equal(authService.verify(token, now + 1000).email, 'admin@may.vn');
  assert.equal(authService.verify(token, now + config.sessionHours * 3600 * 1000), null);
  assert.equal(authService.verify(token, now), null, 'phiên hết hạn đã bị xóa');
});
