import { useState } from 'react';
import { Link } from 'react-router-dom';
import VoucherInput from '../components/VoucherInput.jsx';
import { useCart } from '../store/useCart.js';
import { MAX_QUANTITY } from '../store/cartStore.js';
import { formatPrice } from '../utils/format.js';
import { formatItemOptions } from '../utils/orderLabels.js';

function CartLine({ item, cart }) {
  const { key, quantity } = item;
  return (
    <li className="cart-line">
      <div className="cart-line__info">
        <Link to={`/menu/${item.drinkId}`} className="cart-line__name">
          {item.description}
        </Link>
        <p className="muted">{formatItemOptions(item)}</p>
        <p className="cart-line__unit">{formatPrice(item.unitPrice)} / ly</p>
      </div>
      <div className="cart-line__controls">
        <div className="stepper" role="group" aria-label="Số lượng">
          <button
            type="button"
            className="stepper__btn"
            onClick={() => cart.updateQuantity(key, quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="stepper__value" aria-live="polite">{quantity}</span>
          <button
            type="button"
            className="stepper__btn"
            onClick={() => cart.updateQuantity(key, quantity + 1)}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        <strong className="price">{formatPrice(item.unitPrice * quantity)}</strong>
        <button type="button" className="link-btn cart-line__remove" onClick={() => cart.removeItem(key)}>
          Xóa
        </button>
      </div>
    </li>
  );
}

export default function Cart() {
  const { items, count, subtotal, voucherCode, cart } = useCart();
  const [voucher, setVoucher] = useState(null);

  // Ghi kèm tạm tính lúc kiểm tra mã: giỏ vừa đổi thì chờ kết quả kiểm tra lại, không hiện số cũ.
  const handleVoucherChange = (result) => {
    setVoucher(result ? { ...result, subtotal } : null);
    cart.setVoucherCode(result?.code ?? null);
  };

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="container narrow center">
          <h1>Giỏ hàng</h1>
          <div className="cart-empty">
            <p className="cart-empty__icon" aria-hidden>🧋</p>
            <p className="lead">Giỏ hàng đang trống. Chọn một ly trà sữa thật ngon nhé!</p>
            <Link to="/menu" className="btn">Xem menu</Link>
          </div>
        </div>
      </section>
    );
  }

  const applied = voucher?.subtotal === subtotal ? voucher : null;
  // Phí giao hàng do server cộng vào khi kiểm tra mã: total = tạm tính + phí ship − giảm giá.
  const shippingFee = applied ? applied.total - subtotal + applied.discount : 0;

  return (
    <section className="section">
      <div className="container narrow">
        <h1>Giỏ hàng</h1>

        <ul className="cart-lines">
          {items.map((item) => (
            <CartLine key={item.key} item={item} cart={cart} />
          ))}
        </ul>

        <VoucherInput subtotal={subtotal} initialCode={voucherCode ?? ''} onChange={handleVoucherChange} />

        <div className="panel">
          <dl className="summary cart__summary">
            <div><dt>Tạm tính ({count} ly)</dt><dd>{formatPrice(subtotal)}</dd></div>
            {applied && (
              <>
                <div><dt>Phí giao hàng</dt><dd>{formatPrice(shippingFee)}</dd></div>
                <div><dt>Giảm giá ({applied.code})</dt><dd>−{formatPrice(applied.discount)}</dd></div>
                <div className="summary__total"><dt>Tổng thanh toán</dt><dd>{formatPrice(applied.total)}</dd></div>
              </>
            )}
          </dl>
          {!applied && <p className="muted cart__note">Chưa gồm phí giao hàng, phí được tính ở bước đặt hàng.</p>}
        </div>

        <div className="cart__actions">
          <Link to="/menu" className="btn btn--ghost">Chọn thêm món</Link>
          <Link to="/checkout" className="btn">Tiến hành đặt hàng</Link>
        </div>
      </div>
    </section>
  );
}
