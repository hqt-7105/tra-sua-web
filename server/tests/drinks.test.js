// Menu qua Factory Method — TV1 (Sprint 1): GET /api/drinks và /api/drinks/:id.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

test('GET /drinks/:id trả thêm categoryName và customization, giữ nguyên trường cũ (đúng API.md)', async () => {
  const { status, body } = await api.get('/drinks/ts-truyen-thong');
  assert.equal(status, 200);
  assert.deepEqual(body, {
    id: 'ts-truyen-thong',
    categoryId: 'tra-sua',
    name: 'Trà sữa truyền thống',
    basePrice: 35000,
    description: 'Hồng trà đậm vị pha sữa béo nhẹ, công thức nhà làm.',
    image: '/images/drinks/ts-truyen-thong.svg',
    isBestSeller: true,
    isActive: true,
    categoryName: 'Trà sữa',
    customization: { allowToppings: true, allowSugar: true, allowIce: true },
  });
});

test('mỗi loại đồ uống tự khai báo quy tắc tùy chỉnh của mình', async () => {
  const coffee = await api.get('/drinks/cf-muoi');
  assert.equal(coffee.body.categoryName, 'Cà phê');
  assert.equal(coffee.body.customization.allowToppings, false, 'cà phê không thêm topping');

  const iceBlended = await api.get('/drinks/dx-socola');
  assert.equal(iceBlended.body.categoryName, 'Đá xay');
  assert.equal(iceBlended.body.customization.allowIce, false, 'đá xay không chỉnh mức đá');

  const fruitTea = await api.get('/drinks/ttc-dao');
  assert.equal(fruitTea.body.categoryName, 'Trà trái cây');
});

test('GET /drinks: mọi món có categoryName khớp danh mục, bộ lọc vẫn chạy như cũ', async () => {
  const categories = (await api.get('/categories')).body;
  const nameOf = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const { status, body } = await api.get('/drinks');
  assert.equal(status, 200);
  assert.ok(body.length >= 10);
  for (const drink of body) {
    assert.equal(drink.categoryName, nameOf[drink.categoryId], drink.id);
    assert.equal(typeof drink.basePrice, 'number', drink.id);
    assert.equal(typeof drink.customization.allowToppings, 'boolean', drink.id);
  }

  const coffees = await api.get('/drinks?categoryId=ca-phe');
  assert.ok(coffees.body.length > 0);
  assert.ok(coffees.body.every((d) => d.customization.allowToppings === false));
});
