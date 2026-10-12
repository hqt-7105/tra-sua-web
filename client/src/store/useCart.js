import { useSyncExternalStore } from 'react';
import { CartStore } from './cartStore.js';

/**
 * Hook React đọc giỏ hàng dùng chung — TV2 (Singleton).
 * Mọi component gọi useCart() đều nhận CÙNG một CartStore.getInstance(), và tự
 * vẽ lại khi giỏ đổi nhờ useSyncExternalStore + cart.subscribe().
 *
 *   const { items, count, subtotal, voucherCode, cart } = useCart();
 *   cart.addItem(...), cart.updateQuantity(key, n), cart.removeItem(key), cart.clear(),
 *   cart.setVoucherCode(code)
 */
const cart = CartStore.getInstance();
const subscribe = (onChange) => cart.subscribe(onChange);
const getSnapshot = () => cart.getSnapshot();

export function useCart() {
  const { items, voucherCode } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return { items, count, subtotal, voucherCode, cart };
}
