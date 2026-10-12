// Tính giá dòng món — TV3 (Sprint 1): POST /api/cart/price (Builder + Factory Method + Decorator).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { createOrderItem } from '../src/services/orderItemService.js';

let api;
before(async () => {
  api = await startTestServer();
});
after(() => api.close());

const price = (body) => api.post('/cart/price', body);

test('size L, 2 topping, số lượng 2 tính đúng giá (đúng ví dụ trong API.md)', async () => {
  const { status, body } = await price({
    drinkId: 'ts-truyen-thong', size: 'L', sugar: 50, ice: 70,
    toppingIds: ['tran-chau-den', 'pudding'], quantity: 2, note: 'ít ngọt',
  });
  assert.equal(status, 200);
  assert.deepEqual(body, {
    drinkId: 'ts-truyen-thong',
    description: 'Trà sữa truyền thống + Trân châu đen + Pudding trứng',
    size: 'L', sugar: 50, ice: 70,
    toppings: [
      { id: 'tran-chau-den', name: 'Trân châu đen', price: 5000 },
      { id: 'pudding', name: 'Pudding trứng', price: 7000 },
    ],
    quantity: 2, note: 'ít ngọt',
    unitPrice: 53000, totalPrice: 106000,
  });
});

test('chỉ gửi drinkId thì dùng lựa chọn mặc định (BR03)', async () => {
  const { status, body } = await price({ drinkId: 'ts-matcha' });
  assert.equal(status, 200);
  assert.equal(body.size, 'M');
  assert.equal(body.sugar, 100);
  assert.equal(body.ice, 100);
  assert.equal(body.quantity, 1);
  assert.equal(body.note, '');
  assert.equal(body.unitPrice, 42000);
});

test('chọn cùng topping 2 lần thì cộng giá 2 lần (BR04); bỏ qua giá gửi từ trình duyệt (BR02)', async () => {
  const { body } = await price({
    drinkId: 'ts-truyen-thong', toppingIds: ['tran-chau-den', 'tran-chau-den'], unitPrice: 1, totalPrice: 1,
  });
  assert.equal(body.unitPrice, 45000);
  assert.equal(body.totalPrice, 45000);
});

test('món hoặc topping không tồn tại trả 404', async () => {
  const drink = await price({ drinkId: 'khong-co' });
  assert.equal(drink.status, 404);
  assert.match(drink.body.error, /Không tìm thấy món/);

  const topping = await price({ drinkId: 'ts-truyen-thong', toppingIds: ['tran-chau-den', 'khong-co'] });
  assert.equal(topping.status, 404);
  assert.match(topping.body.error, /topping/);
});

test('tùy chọn sai trả 400 kèm field cho biết ô nào sai', async () => {
  const cases = [
    [{ size: 'XL' }, 'size'],
    [{ sugar: 40 }, 'sugar'],
    [{ ice: 120 }, 'ice'],
    [{ quantity: 0 }, 'quantity'],
    [{ quantity: 21 }, 'quantity'],
    [{ quantity: 1.5 }, 'quantity'],
    [{ toppingIds: 'pudding' }, 'toppingIds'],
    [{ note: 123 }, 'note'],
  ];
  for (const [patch, field] of cases) {
    const { status, body } = await price({ drinkId: 'ts-truyen-thong', ...patch });
    assert.equal(status, 400, JSON.stringify(patch));
    assert.equal(body.field, field, JSON.stringify(patch));
    assert.ok(body.error, JSON.stringify(patch));
  }
  const missing = await price({});
  assert.equal(missing.status, 400);
  assert.equal(missing.body.field, 'drinkId');
});

test('quy tắc riêng của loại đồ uống: cà phê không thêm topping, đá xay không chỉnh đá', async () => {
  const coffee = await price({ drinkId: 'cf-muoi', toppingIds: ['pudding'] });
  assert.equal(coffee.status, 400);
  assert.equal(coffee.body.field, 'toppingIds');
  assert.match(coffee.body.error, /Cà phê muối không thêm được topping/);

  const iceBlended = await price({ drinkId: 'dx-socola', ice: 50 });
  assert.equal(iceBlended.status, 400);
  assert.equal(iceBlended.body.field, 'ice');

  const ok = await price({ drinkId: 'dx-socola', size: 'L', sugar: 50, toppingIds: ['kem-cheese'] });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.unitPrice, 49000 + 6000 + 10000);
});

test('createOrderItem trả OrderItem dùng được cho OrderFacade (Sprint 2)', () => {
  const item = createOrderItem({ drinkId: 'ttc-dao', toppingIds: ['thach-dua'], quantity: 3 });
  assert.equal(item.totalPrice, (39000 + 5000) * 3);
  assert.equal(typeof item.toJSON, 'function');
});
