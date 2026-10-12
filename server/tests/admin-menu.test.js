// Quản lý menu qua Proxy — TV4 (Sprint 2): /api/admin/drinks, /toppings, /audit-log.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let api;
let admin;
let staff;
before(async () => {
  api = await startTestServer();
  admin = await api.loginAs('admin');
  staff = await api.loginAs('staff');
});
after(() => api.close());

test('chưa đăng nhập thì mọi route menu admin trả 401', async () => {
  assert.equal((await api.get('/admin/drinks')).status, 401);
  assert.equal((await api.put('/admin/drinks/ts-truyen-thong', { basePrice: 1 })).status, 401);
});

test('nhân viên xem được menu nhưng sửa giá bị 403, giá không đổi (BR20)', async () => {
  const list = await api.get('/admin/drinks', staff);
  assert.equal(list.status, 200);
  assert.ok(list.body.some((d) => d.id === 'ts-truyen-thong'));

  const { status, body } = await api.put('/admin/drinks/ts-truyen-thong', { basePrice: 1000 }, staff);
  assert.equal(status, 403);
  assert.equal(body.error, 'Bạn không có quyền thực hiện thao tác này');
  assert.equal((await api.get('/drinks/ts-truyen-thong')).body.basePrice, 35000);
});

test('admin sửa giá được, nhật ký ghi lại (BR22)', async () => {
  const { status, body } = await api.put('/admin/drinks/ts-truyen-thong', { basePrice: 36000 }, admin);
  assert.equal(status, 200);
  assert.equal(body.basePrice, 36000);
  assert.equal((await api.get('/drinks/ts-truyen-thong')).body.basePrice, 36000);

  const log = await api.get('/admin/audit-log', admin);
  assert.equal(log.status, 200);
  assert.equal(log.body[0].email, 'admin@may.vn');
  assert.equal(log.body[0].action, 'updateDrink');
  assert.equal(log.body[0].targetId, 'ts-truyen-thong');
  assert.ok(log.body[0].at);
});

test('thêm món mới: id tự sinh từ tên, hiện ở menu khách', async () => {
  const { status, body } = await api.post(
    '/admin/drinks',
    { categoryId: 'tra-sua', name: 'Trà sữa khoai môn nướng', basePrice: 41000, description: 'Món thử' },
    admin,
  );
  assert.equal(status, 200);
  assert.equal(body.id, 'tra-sua-khoai-mon-nuong');
  assert.equal(body.isActive, true);
  assert.equal(body.image, null);
  assert.equal((await api.get(`/drinks/${body.id}`)).status, 200);
});

test('dữ liệu sai trả 400 kèm field (BR19)', async () => {
  const cases = [
    [{ categoryId: 'tra-sua', name: '  ', basePrice: 30000 }, 'name'],
    [{ categoryId: 'tra-sua', name: 'Món A', basePrice: -1 }, 'basePrice'],
    [{ categoryId: 'tra-sua', name: 'Món A', basePrice: 30000.5 }, 'basePrice'],
    [{ categoryId: 'khong-co', name: 'Món A', basePrice: 30000 }, 'categoryId'],
  ];
  for (const [drink, field] of cases) {
    const { status, body } = await api.post('/admin/drinks', drink, admin);
    assert.equal(status, 400, JSON.stringify(drink));
    assert.equal(body.field, field);
  }
  const topping = await api.post('/admin/toppings', { name: 'Thạch', price: '5000' }, admin);
  assert.equal(topping.status, 400);
  assert.equal(topping.body.field, 'price');
});

test('ngừng bán thay cho xóa: món ẩn khỏi menu khách, admin vẫn thấy (BR23)', async () => {
  const { status, body } = await api.delete('/admin/drinks/cf-muoi', admin);
  assert.equal(status, 200);
  assert.equal(body.isActive, false);
  assert.equal((await api.get('/drinks/cf-muoi')).status, 404);
  assert.ok(!(await api.get('/admin/drinks', admin)).body.some((d) => d.id === 'cf-muoi'));
  const all = await api.get('/admin/drinks?includeInactive=true', admin);
  assert.equal(all.body.find((d) => d.id === 'cf-muoi').isActive, false);

  // Mở bán lại bằng PUT isActive
  const reopened = await api.put('/admin/drinks/cf-muoi', { isActive: true }, admin);
  assert.equal(reopened.body.isActive, true);
});

test('topping: thêm, sửa, ngừng bán; món/topping không có trả 404', async () => {
  const created = await api.post('/admin/toppings', { name: 'Thạch cà phê', price: 6000 }, admin);
  assert.equal(created.status, 200);
  assert.equal(created.body.id, 'thach-ca-phe');
  const updated = await api.put(`/admin/toppings/${created.body.id}`, { price: 7000 }, admin);
  assert.equal(updated.body.price, 7000);
  const removed = await api.delete(`/admin/toppings/${created.body.id}`, admin);
  assert.equal(removed.body.isActive, false);
  assert.ok(!(await api.get('/toppings')).body.some((t) => t.id === created.body.id));

  assert.equal((await api.put('/admin/drinks/khong-co', { basePrice: 1 }, admin)).status, 404);
  assert.equal((await api.delete('/admin/toppings/khong-co', admin)).status, 404);
});

test('nhân viên không xem được nhật ký, thao tác bị từ chối không được ghi', async () => {
  const before = (await api.get('/admin/audit-log', admin)).body.length;
  await api.delete('/admin/toppings/pudding', staff);
  assert.equal((await api.get('/admin/audit-log', staff)).status, 403);
  assert.equal((await api.get('/admin/audit-log', admin)).body.length, before);
});
