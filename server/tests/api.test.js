// Kiểm tra API Sprint 0 bằng cách mở server ở cổng ngẫu nhiên.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => server.close());

const get = async (path) => {
  const res = await fetch(baseUrl + path);
  return { status: res.status, body: await res.json() };
};

test('GET /health', async () => {
  const { status, body } = await get('/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('GET /categories trả 4 danh mục', async () => {
  const { body } = await get('/categories');
  assert.equal(body.length, 4);
});

test('GET /drinks lọc theo danh mục, best seller và từ khóa', async () => {
  const all = await get('/drinks');
  assert.ok(all.body.length >= 10);

  const milkTeas = await get('/drinks?categoryId=tra-sua');
  assert.ok(milkTeas.body.every((d) => d.categoryId === 'tra-sua'));

  const best = await get('/drinks?bestSeller=true');
  assert.ok(best.body.length > 0 && best.body.every((d) => d.isBestSeller));

  const search = await get('/drinks?q=matcha');
  assert.deepEqual(search.body.map((d) => d.id), ['ts-matcha']);
});

test('GET /drinks/:id trả 404 khi không có món', async () => {
  assert.equal((await get('/drinks/ts-truyen-thong')).status, 200);
  assert.equal((await get('/drinks/khong-co')).status, 404);
});

test('GET /toppings và /options', async () => {
  assert.ok((await get('/toppings')).body.length >= 5);
  const { body } = await get('/options');
  assert.deepEqual(body.defaults, { size: 'M', sugar: 100, ice: 100, quantity: 1 });
});

test('đường dẫn API không tồn tại trả 404 kèm thông báo tiếng Việt', async () => {
  const { status, body } = await get('/khong-co-route-nay');
  assert.equal(status, 404);
  assert.match(body.error, /Không tìm thấy/);
});

// ---------------------------------------------------------------- C4 (TV4): test API bổ sung
const post = async (path, data) => {
  const res = await fetch(baseUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json() };
};

test('C4 · GET /categories: đủ 4 danh mục, mỗi mục có id và tên', async () => {
  const { status, body } = await get('/categories');
  assert.equal(status, 200);
  assert.deepEqual(body.map((c) => c.id).sort(), ['ca-phe', 'da-xay', 'tra-sua', 'tra-trai-cay']);
  assert.ok(body.every((c) => typeof c.name === 'string' && c.name.length > 0));
});

test('C4 · GET /drinks: kết hợp bộ lọc, tìm không phân biệt hoa thường, có phần Factory Method tự mô tả', async () => {
  const combined = await get('/drinks?categoryId=ca-phe&bestSeller=true');
  assert.ok(combined.body.length > 0);
  assert.ok(combined.body.every((d) => d.categoryId === 'ca-phe' && d.isBestSeller && d.isActive));

  const upper = await get('/drinks?q=MATCHA');
  assert.deepEqual(upper.body.map((d) => d.id), ['ts-matcha']);
  assert.deepEqual((await get('/drinks?q=khong-co-mon-nay')).body, []);

  const coffee = combined.body[0];
  assert.equal(coffee.categoryName, 'Cà phê');
  assert.equal(coffee.customization.allowToppings, false);
});

test('C4 · GET /toppings: chỉ topping đang bán, giá là số nguyên VND không âm', async () => {
  const { status, body } = await get('/toppings');
  assert.equal(status, 200);
  assert.ok(body.every((t) => t.isActive && Number.isInteger(t.price) && t.price >= 0));
  assert.ok(body.some((t) => t.id === 'tran-chau-den' && t.price === 5000));
});

test('C4 · GET /options: size M/L kèm phụ thu, mức đường và đá theo BR03', async () => {
  const { body } = await get('/options');
  assert.deepEqual(body.sizes.map((s) => [s.id, s.extraPrice]), [['M', 0], ['L', 6000]]);
  assert.deepEqual(body.sugarLevels, [0, 30, 50, 70, 100]);
  assert.deepEqual(body.iceLevels, [0, 30, 50, 70, 100]);
});

test('C4 · id không có trả 404 kèm thông báo tiếng Việt (món, đơn hàng)', async () => {
  const drink = await get('/drinks/khong-co');
  assert.equal(drink.status, 404);
  assert.equal(drink.body.error, 'Không tìm thấy món');
  const order = await get('/orders/DH999');
  assert.equal(order.status, 404);
  assert.match(order.body.error, /Không tìm thấy đơn DH999/);
});

test('C4 · định dạng lỗi thống nhất: { error } và thêm field khi dữ liệu sai', async () => {
  const notFound = await get('/khong-co-route-nay');
  assert.deepEqual(Object.keys(notFound.body), ['error']);

  const invalid = await post('/cart/price', { drinkId: 'ts-truyen-thong', size: 'XL' });
  assert.equal(invalid.status, 400);
  assert.deepEqual(Object.keys(invalid.body).sort(), ['error', 'field']);
  assert.equal(invalid.body.field, 'size');
  assert.equal(typeof invalid.body.error, 'string');
});
