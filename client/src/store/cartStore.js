/**
 * ============================================================================
 * PATTERN: Singleton (Creational) — PHỤ TRÁCH: TV2
 * ============================================================================
 * Vấn đề:
 *   Header (số ly trên icon giỏ), trang Chi tiết món (nút "Thêm vào giỏ"),
 *   trang Giỏ hàng và Checkout đều phải dùng CHUNG một giỏ hàng. Nếu mỗi nơi
 *   tự tạo giỏ riêng thì dữ liệu lệch nhau.
 *
 * Giải pháp:
 *   Chỉ cho tạo một instance duy nhất qua CartStore.getInstance(). Constructor
 *   bị khóa bằng cờ riêng tư #creating nên gọi new CartStore() ở ngoài sẽ báo
 *   lỗi. Mọi trang cùng đọc/ghi một đối tượng và đăng ký (subscribe) để tự
 *   vẽ lại khi giỏ đổi.
 *
 * Cấu trúc GoF:
 *   Singleton = CartStore (static #instance, static getInstance(), constructor bị khóa)
 *   Client    = Layout (Header), DrinkDetail, Cart, Checkout — qua hook useCart()
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
 *   cart.clear()                               // xóa cả mã giảm giá đã áp
 *   cart.getItems()      → BẢN SAO mảng món (sửa bên ngoài không ảnh hưởng giỏ)
 *   cart.getCount()      → tổng số ly
 *   cart.getSubtotal()   → tổng tiền = Σ unitPrice * quantity
 *   cart.subscribe(fn)   → trả về hàm hủy đăng ký; fn(items) được gọi mỗi khi
 *                          giỏ thay đổi (để Header, trang Giỏ tự cập nhật)
 *   Bổ sung:
 *   cart.getSnapshot()   → { items, voucherCode } bất biến, chỉ đổi khi giỏ đổi
 *                          (dùng cho useSyncExternalStore trong useCart)
 *   cart.setVoucherCode(code | null), cart.getVoucherCode() — mã đã áp ở giỏ,
 *                          trang Checkout đọc lại
 *   Lưu/đọc localStorage key 'may-cart' nếu có; bọc try/catch để vẫn chạy
 *   được trong Node (test) và chế độ ẩn danh.
 *
 * Ví dụ:
 *   const cart = CartStore.getInstance();
 *   cart.addItem({ key: 'ts|M', drinkId: 'ts', unitPrice: 35000, quantity: 1 });
 *   CartStore.getInstance().getCount();        // 1 — cùng một giỏ ở mọi nơi
 *
 * Hook React: src/store/useCart.js (useSyncExternalStore + subscribe()).
 * Test chấp nhận: client/tests/cartStore.test.js
 * ============================================================================
 */

const STORAGE_KEY = 'may-cart';
/** Số lượng tối đa mỗi dòng món (BR13, khớp config.maxQuantityPerItem ở server). */
export const MAX_QUANTITY = 20;

const clone = (value) => JSON.parse(JSON.stringify(value));
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

function readStorage() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(data) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* localStorage bị chặn (ẩn danh) → giỏ chỉ sống trong phiên này */
  }
}

/** Bỏ các dòng hỏng trong dữ liệu đã lưu (ví dụ do sửa tay localStorage). */
function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) =>
      item &&
      typeof item.key === 'string' &&
      Number.isInteger(item.unitPrice) &&
      item.unitPrice >= 0 &&
      isPositiveInt(item.quantity),
  );
}

export class CartStore {
  /** Instance duy nhất, chỉ getInstance() được gán. */
  static #instance = null;
  /** Cờ cho phép constructor chạy — chỉ bật bên trong getInstance(). */
  static #creating = false;

  #items = [];
  #voucherCode = null;
  #listeners = new Set();
  #snapshot;

  constructor() {
    if (!CartStore.#creating) {
      throw new Error('CartStore là Singleton: hãy dùng CartStore.getInstance(), không gọi new CartStore()');
    }
    this.#load();
    // Mở nhiều tab: tab khác sửa giỏ thì tab này cập nhật theo.
    globalThis.addEventListener?.('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        this.#load();
        this.#notify();
      }
    });
  }

  static getInstance() {
    if (!CartStore.#instance) {
      CartStore.#creating = true;
      try {
        CartStore.#instance = new CartStore();
      } finally {
        CartStore.#creating = false;
      }
    }
    return CartStore.#instance;
  }

  addItem(item) {
    if (!item || typeof item.key !== 'string' || !item.key) {
      throw new TypeError('Món thêm vào giỏ phải có key');
    }
    if (!Number.isInteger(item.unitPrice) || item.unitPrice < 0) {
      throw new TypeError('unitPrice phải là số nguyên VND không âm');
    }
    const quantity = item.quantity ?? 1;
    if (!isPositiveInt(quantity)) {
      throw new TypeError('Số lượng phải là số nguyên lớn hơn 0');
    }

    const existing = this.#items.find((i) => i.key === item.key);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, MAX_QUANTITY);
    } else {
      this.#items.push({ ...clone(item), quantity: Math.min(quantity, MAX_QUANTITY) });
    }
    this.#commit();
  }

  updateQuantity(key, quantity) {
    if (!Number.isInteger(quantity)) {
      throw new TypeError('Số lượng phải là số nguyên');
    }
    if (quantity <= 0) {
      this.removeItem(key);
      return;
    }
    const existing = this.#items.find((i) => i.key === key);
    if (!existing) return;
    existing.quantity = Math.min(quantity, MAX_QUANTITY);
    this.#commit();
  }

  removeItem(key) {
    const before = this.#items.length;
    this.#items = this.#items.filter((i) => i.key !== key);
    if (this.#items.length !== before) this.#commit();
  }

  clear() {
    this.#items = [];
    this.#voucherCode = null;
    this.#commit();
  }

  getItems() {
    return clone(this.#items);
  }

  getCount() {
    return this.#items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getSubtotal() {
    return this.#items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  }

  getVoucherCode() {
    return this.#voucherCode;
  }

  setVoucherCode(code) {
    const next = typeof code === 'string' && code.trim() ? code.trim().toUpperCase() : null;
    if (next === this.#voucherCode) return;
    this.#voucherCode = next;
    this.#commit();
  }

  getSnapshot() {
    return this.#snapshot;
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #load() {
    const saved = readStorage();
    // Dữ liệu cũ có thể chỉ là mảng món.
    this.#items = sanitizeItems(Array.isArray(saved) ? saved : saved?.items);
    this.#voucherCode = typeof saved?.voucherCode === 'string' ? saved.voucherCode : null;
    this.#refreshSnapshot();
  }

  #refreshSnapshot() {
    this.#snapshot = Object.freeze({
      items: Object.freeze(clone(this.#items)),
      voucherCode: this.#voucherCode,
    });
  }

  /** Sau mỗi thay đổi: chụp lại snapshot, lưu localStorage, báo cho người đăng ký. */
  #commit() {
    writeStorage({ items: this.#items, voucherCode: this.#voucherCode });
    this.#notify();
  }

  #notify() {
    this.#refreshSnapshot();
    const items = this.getItems();
    this.#listeners.forEach((listener) => listener(items));
  }
}
