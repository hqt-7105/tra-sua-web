/**
 * ============================================================================
 * PATTERN: Singleton (Creational) — PHỤ TRÁCH: TV2        [Sprint 1 - CHƯA LÀM]
 * ============================================================================
 * Vấn đề:
 *   Header (số ly trên icon giỏ), trang Chi tiết món (nút "Thêm vào giỏ"),
 *   trang Giỏ hàng và Checkout đều phải dùng CHUNG một giỏ hàng. Nếu mỗi nơi
 *   tự tạo giỏ riêng thì dữ liệu lệch nhau.
 *
 * Giải pháp:
 *   Chỉ cho tạo một instance duy nhất qua CartStore.getInstance().
 *
 * Hợp đồng (TV1, TV3 sẽ gọi đúng như sau):
 *   const cart = CartStore.getInstance();      // luôn trả cùng một đối tượng
 *   new CartStore()                            // gọi trực tiếp → throw Error
 *   cart.addItem(item)
 *     item = { key, drinkId, description, size, sugar, ice, toppings,
 *              unitPrice, quantity, note }
 *     key  = chuỗi định danh tổ hợp tùy chọn; cùng key → cộng dồn quantity
 *   cart.updateQuantity(key, quantity)         // quantity <= 0 → xóa món
 *   cart.removeItem(key)
 *   cart.clear()
 *   cart.getItems()      → BẢN SAO mảng món (sửa bên ngoài không ảnh hưởng giỏ)
 *   cart.getCount()      → tổng số ly
 *   cart.getSubtotal()   → tổng tiền = Σ unitPrice * quantity
 *   cart.subscribe(fn)   → trả về hàm hủy đăng ký; fn(items) được gọi mỗi khi
 *                          giỏ thay đổi (để Header, trang Giỏ tự cập nhật)
 *   Lưu/đọc localStorage key 'may-cart' nếu có; bọc try/catch để vẫn chạy
 *   được trong Node (test) và chế độ ẩn danh.
 *
 * Kèm theo: hook React useCart() trong src/store/useCart.js (TV2 tạo) dùng
 *   useSyncExternalStore + subscribe() ở trên.
 *
 * Test chấp nhận: client/tests/cartStore.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */

const todo = (method) => {
  throw new Error(`TODO(TV2): chưa cài CartStore.${method}()`);
};

export class CartStore {
  static getInstance() {
    return todo('getInstance');
  }

  // eslint-disable-next-line no-unused-vars
  addItem(item) { return todo('addItem'); }
  // eslint-disable-next-line no-unused-vars
  updateQuantity(key, quantity) { return todo('updateQuantity'); }
  // eslint-disable-next-line no-unused-vars
  removeItem(key) { return todo('removeItem'); }
  clear() { return todo('clear'); }
  getItems() { return todo('getItems'); }
  getCount() { return todo('getCount'); }
  getSubtotal() { return todo('getSubtotal'); }
  // eslint-disable-next-line no-unused-vars
  subscribe(listener) { return todo('subscribe'); }
}
