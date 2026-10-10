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

test('API của Sprint 1 đang trả 501 kèm tên người phụ trách', async () => {
  const res = await fetch(`${baseUrl}/orders/DH001`);
  assert.equal(res.status, 501);
  assert.equal((await res.json()).owner, 'TV5');
});
