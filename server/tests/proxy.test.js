// Proxy — TV4 (Sprint 2). Test chấp nhận đã bật toàn bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MenuServiceProxy, MENU_SERVICE_METHODS } from '../src/patterns/structural/MenuServiceProxy.js';

const admin = { email: 'admin@may.vn', role: 'admin' };
const staff = { email: 'staff@may.vn', role: 'staff' };

/** MenuService giả: ghi lại hàm nào đã được gọi */
function fakeRealService({ failOn } = {}) {
  const calls = [];
  const service = {};
  for (const method of MENU_SERVICE_METHODS) {
    service[method] = (...args) => {
      calls.push(method);
      if (method === failOn) throw Object.assign(new Error('Không tìm thấy món'), { status: 404 });
      if (method.startsWith('list')) return [{ id: 'ts-truyen-thong' }];
      if (method.startsWith('create')) return { id: 'mon-moi', ...args[0] };
      return { id: args[0], ...args[1] };
    };
  }
  return { service, calls };
}

test('proxy có đủ các hàm giống MenuService thật', () => {
  const proxy = new MenuServiceProxy(fakeRealService().service, admin);
  for (const method of MENU_SERVICE_METHODS) {
    assert.equal(typeof proxy[method], 'function', `thiếu hàm ${method}`);
  }
});

test('nhân viên được xem menu', async () => {
  const { service, calls } = fakeRealService();
  const result = await new MenuServiceProxy(service, staff).listDrinks();
  assert.deepEqual(result, [{ id: 'ts-truyen-thong' }]);
  assert.deepEqual(calls, ['listDrinks']);
});

test('nhân viên KHÔNG được sửa menu, service thật không bị gọi', async () => {
  const { service, calls } = fakeRealService();
  const proxy = new MenuServiceProxy(service, staff);
  await assert.rejects(async () => proxy.createDrink({ name: 'Món mới' }), { status: 403 });
  await assert.rejects(async () => proxy.deactivateTopping('pudding'), { status: 403 });
  assert.deepEqual(calls, []);
});

test('chưa đăng nhập thì 401', async () => {
  const { service, calls } = fakeRealService();
  await assert.rejects(async () => new MenuServiceProxy(service, null).listDrinks(), { status: 401 });
  assert.deepEqual(calls, []);
});

test('admin sửa menu thì ghi nhật ký', async () => {
  const { service } = fakeRealService();
  const auditLog = [];
  const proxy = new MenuServiceProxy(service, admin, auditLog);

  const created = await proxy.createDrink({ name: 'Món mới', basePrice: 30000 });
  assert.equal(created.id, 'mon-moi');
  await proxy.updateDrink('ts-truyen-thong', { basePrice: 36000 });
  await proxy.listDrinks();

  assert.equal(auditLog.length, 2, 'chỉ ghi nhật ký thao tác SỬA');
  assert.equal(auditLog[0].email, 'admin@may.vn');
  assert.equal(auditLog[0].action, 'createDrink');
  assert.equal(auditLog[0].targetId, 'mon-moi');
  assert.ok(auditLog[0].at);
  assert.equal(auditLog[1].targetId, 'ts-truyen-thong');
});

test('service thật báo lỗi thì ném tiếp và không ghi nhật ký', async () => {
  const { service } = fakeRealService({ failOn: 'updateDrink' });
  const auditLog = [];
  const proxy = new MenuServiceProxy(service, admin, auditLog);
  await assert.rejects(async () => proxy.updateDrink('khong-co', {}), { status: 404 });
  assert.equal(auditLog.length, 0);
});
