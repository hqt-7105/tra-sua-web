import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import PaymentMethodPicker from '../components/PaymentMethodPicker.jsx';
import EmptyState from '../components/EmptyState.jsx';
import VoucherInput from '../components/VoucherInput.jsx';
import { useToast } from '../hooks/useToast.js';
import { useCart } from '../store/useCart.js';
import { formatPrice } from '../utils/format.js';
import { formatItemOptions } from '../utils/orderLabels.js';
import { validateAddress, validateName, validateNote, validatePhone } from '../utils/validators.js';

/**
 * Trang đặt hàng — TV1 (Client của Facade, UC06).
 * Kiểm tra sớm bằng validators bản trình duyệt (B3), rồi gửi MỘT request POST /api/orders;
 * server (OrderFacade) kiểm tra lại, tính giá, giảm giá, thanh toán, lưu đơn.
 * Lỗi có `field` hiện ngay dưới ô tương ứng; thành công thì xóa giỏ và chuyển sang
 * cổng thanh toán (nếu có redirectUrl) hoặc trang theo dõi đơn.
 */

/** Phí giao hàng cố định (BR06), khớp config.shippingFee ở server — chỉ để hiển thị, server tính lại. */
const SHIPPING_FEE = 15000;

/** Ô trong form → hàm kiểm tra và id của ô (để focus khi lỗi). field khớp field lỗi API trả về. */
const FIELDS = {
  'customer.name': { key: 'name', id: 'checkout-name', check: validateName },
  'customer.phone': { key: 'phone', id: 'checkout-phone', check: validatePhone },
  'customer.address': { key: 'address', id: 'checkout-address', check: validateAddress },
  'customer.note': { key: 'note', id: 'checkout-note', check: validateNote },
};

const EMPTY_FORM = { name: '', phone: '', address: '', note: '' };

/** Dòng trong giỏ → dòng món gửi lên server (không gửi giá: server tự tính, BR02). */
const toOrderLine = ({ drinkId, size, sugar, ice, toppings = [], quantity, note }) => ({
  drinkId,
  size,
  sugar,
  ice,
  toppingIds: toppings.map((t) => t.id),
  quantity,
  note,
});

/** → { errors, customer }: customer là dữ liệu đã chuẩn hóa (bỏ khoảng trắng, +84 → 0) để gửi lên. */
function validateForm(form) {
  const errors = {};
  const customer = {};
  for (const [field, { key, check }] of Object.entries(FIELDS)) {
    const result = check(form[key]);
    if (result.ok) customer[key] = result.value;
    else errors[field] = result.message;
  }
  return { errors, customer };
}

const focusField = (field) => document.getElementById(FIELDS[field]?.id)?.focus();

function TextField({ field, label, value, onChange, onBlur, error, multiline, ...props }) {
  const { id } = FIELDS[field];
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div className="checkout__field">
      <label htmlFor={id} className="field__label">{label}</label>
      <Input
        id={id}
        className="input input--block"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, count, subtotal, voucherCode, cart } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [voucher, setVoucher] = useState(null);
  const [busy, setBusy] = useState(false);

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="container narrow center">
          <h1>Đặt hàng</h1>
          <EmptyState title="Giỏ hàng đang trống" actionLabel="Xem menu" actionTo="/menu">
            Chưa có món nào để đặt.
          </EmptyState>
        </div>
      </section>
    );
  }

  // Mã giảm giá đã áp ở giỏ được VoucherInput kiểm tra lại; số liệu cũ (giỏ vừa đổi) thì bỏ qua.
  const applied = voucher?.subtotal === subtotal ? voucher : null;
  const shippingFee = applied ? applied.total - subtotal + applied.discount : SHIPPING_FEE;
  const total = applied ? applied.total : subtotal + SHIPPING_FEE;

  const handleVoucherChange = (result) => {
    setVoucher(result ? { ...result, subtotal } : null);
    cart.setVoucherCode(result?.code ?? null);
  };

  const recheck = (field, value) => {
    const result = FIELDS[field].check(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (result.ok) delete next[field];
      else next[field] = result.message;
      return next;
    });
  };

  const fieldProps = (field) => {
    const { key } = FIELDS[field];
    return {
      field,
      value: form[key],
      error: errors[field],
      onChange: (e) => {
        const value = e.target.value;
        setForm((f) => ({ ...f, [key]: value }));
        if (errors[field]) recheck(field, value); // đang báo lỗi thì sửa tới đâu cập nhật tới đó
      },
      onBlur: (e) => {
        if (e.target.value || errors[field]) recheck(field, e.target.value);
      },
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    const { errors: found, customer } = validateForm(form);
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      focusField(firstError);
      return;
    }

    setBusy(true);
    try {
      const { order, payment } = await api.post('/orders', {
        customer,
        items: items.map(toOrderLine),
        voucherCode: applied?.code,
        paymentMethod,
      });
      toast.show(`Đặt hàng thành công! Mã đơn của bạn: ${order.id}`, { type: 'success' });
      navigate(payment.redirectUrl || `/orders/${encodeURIComponent(order.id)}`);
      cart.clear();
    } catch (err) {
      setBusy(false);
      if (FIELDS[err.field] || err.field === 'paymentMethod') {
        setErrors({ [err.field]: err.message });
        focusField(err.field);
      } else if (err.status === 402) {
        setErrors({ form: `${err.message}. Bạn thử lại hoặc chọn phương thức thanh toán khác.` });
      } else if (err.field?.startsWith('items')) {
        setErrors({ form: `${err.message} (xem lại ở Giỏ hàng).` });
      } else {
        setErrors({ form: err.message });
      }
    }
  };

  return (
    <section className="section">
      <div className="container checkout">
        <Link to="/cart" className="link">← Quay lại giỏ hàng</Link>
        <h1 className="checkout__title">Đặt hàng</h1>

        {/* VoucherInput có form riêng nên form đặt hàng chỉ bọc cột trái; nút Đặt hàng nối qua thuộc tính form. */}
        <div className="checkout__grid">
          <form id="checkout-form" className="checkout__main" onSubmit={submit} noValidate>
            <div className="panel">
              <h2 className="panel__title">Thông tin giao hàng</h2>
              <TextField label="Họ tên người nhận" autoComplete="name" {...fieldProps('customer.name')} />
              <TextField
                label="Số điện thoại"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ví dụ: 0912345678"
                {...fieldProps('customer.phone')}
              />
              <TextField
                label="Địa chỉ giao hàng"
                autoComplete="street-address"
                placeholder="Số nhà, tên đường, phường/quận"
                {...fieldProps('customer.address')}
              />
              <TextField
                label="Ghi chú cho quán (không bắt buộc)"
                multiline
                rows={2}
                placeholder="Ví dụ: gọi trước khi giao"
                {...fieldProps('customer.note')}
              />
            </div>

            <div className="panel">
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} error={errors.paymentMethod} />
            </div>
          </form>

          <aside className="checkout__side">
            <div className="panel">
              <h2 className="panel__title">Đơn của bạn ({count} ly)</h2>
              <ul className="order-items">
                {items.map((item) => (
                  <li key={item.key} className="order-items__row">
                    <div>
                      <strong>{item.quantity} × {item.description}</strong>
                      <p className="muted">{formatItemOptions(item)}</p>
                    </div>
                    <span className="price">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <VoucherInput subtotal={subtotal} initialCode={voucherCode ?? ''} onChange={handleVoucherChange} />

              <dl className="summary">
                <div><dt>Tạm tính</dt><dd>{formatPrice(subtotal)}</dd></div>
                <div><dt>Phí giao hàng</dt><dd>{formatPrice(shippingFee)}</dd></div>
                {applied && applied.discount > 0 && (
                  <div><dt>Giảm giá ({applied.code})</dt><dd>−{formatPrice(applied.discount)}</dd></div>
                )}
                <div className="summary__total"><dt>Tổng thanh toán</dt><dd>{formatPrice(total)}</dd></div>
              </dl>
            </div>

            {errors.form && <p className="error" role="alert">{errors.form}</p>}
            <button type="submit" form="checkout-form" className="btn btn--lg checkout__submit" disabled={busy}>
              {busy ? 'Đang đặt hàng...' : `Đặt hàng · ${formatPrice(total)}`}
            </button>
            <p className="muted checkout__hint">Quán nhận đơn từ 08:00 đến 22:00. Giá cuối cùng do cửa hàng xác nhận khi đặt.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
