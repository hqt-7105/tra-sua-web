import { useFetch } from '../api/useFetch.js';
import { ErrorBox, Loading } from './Status.jsx';

/**
 * Chọn phương thức thanh toán — TV3 (Adapter). Danh sách lấy từ GET /api/payments/methods,
 * nên thêm cổng mới ở server (adapter + config) thì ô chọn tự có thêm lựa chọn.
 *
 *   <PaymentMethodPicker value={method} onChange={setMethod} error={errors.paymentMethod} />
 *     value     'COD' | 'MOMO' | 'VNPAY'
 *     onChange  (id) => void
 *     error     thông báo lỗi hiện dưới ô (field 'paymentMethod' của API)
 */
const ICONS = { COD: '💵', MOMO: '📱', VNPAY: '🏦' };
const HINTS = {
  COD: 'Trả tiền mặt khi shipper giao tới',
  MOMO: 'Chuyển sang cổng MoMo (thử nghiệm)',
  VNPAY: 'Thẻ ATM / QR qua VNPay (thử nghiệm)',
};

export default function PaymentMethodPicker({ value, onChange, error }) {
  const { data: methods, loading, error: loadError } = useFetch('/payments/methods');

  return (
    <fieldset className="choice pay-methods" aria-describedby={error ? 'payment-method-error' : undefined}>
      <legend className="field__label">Phương thức thanh toán</legend>
      {loading && <Loading />}
      {loadError && <ErrorBox error={loadError} />}
      {methods && (
        <div className="pay-methods__list">
          {methods.map((method) => (
            <label
              key={method.id}
              className={value === method.id ? 'pay-method pay-method--active' : 'pay-method'}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={value === method.id}
                onChange={() => onChange(method.id)}
              />
              <span className="pay-method__icon" aria-hidden>{ICONS[method.id] ?? '💳'}</span>
              <span className="pay-method__text">
                <strong>{method.name}</strong>
                {HINTS[method.id] && <small>{HINTS[method.id]}</small>}
              </span>
            </label>
          ))}
        </div>
      )}
      {error && (
        <p id="payment-method-error" className="field__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
