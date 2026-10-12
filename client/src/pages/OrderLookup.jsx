import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { formatPrice } from '../utils/format.js';
import { STATUS_LABELS, PAYMENT_STATUS_LABELS, formatDateTime } from '../utils/orderLabels.js';
import { validatePhone } from '../utils/validators.js';

/**
 * Tra cứu đơn theo mã + số điện thoại — TV5 (C5). Khách không cần tài khoản:
 * GET /api/orders/lookup?id=&phone= trả đơn khi cả hai khớp, sai thì 404 chung một thông báo.
 */
export default function OrderLookup() {
  const [form, setForm] = useState({ id: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const id = form.id.trim().toUpperCase();
    const phone = validatePhone(form.phone, 'phone');
    const found = {};
    if (!id) found.id = 'Vui lòng nhập mã đơn hàng, ví dụ DH004';
    if (!phone.ok) found.phone = phone.message;
    setErrors(found);
    setOrder(null);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const params = new URLSearchParams({ id, phone: phone.value });
      setOrder(await api.get(`/orders/lookup?${params}`));
    } catch (err) {
      setErrors(
        err.status === 404
          ? { form: 'Không tìm thấy đơn hàng. Bạn kiểm tra lại mã đơn và số điện thoại đã dùng khi đặt nhé.' }
          : { [err.field ?? 'form']: err.message },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section">
      <div className="container narrow">
        <h1>Tra cứu đơn hàng</h1>
        <p className="muted">Nhập mã đơn (trong tin nhắn xác nhận, ví dụ DH004) và số điện thoại bạn dùng khi đặt.</p>

        <form className="panel lookup" onSubmit={submit} noValidate>
          <div className="lookup__fields">
            <div>
              <label htmlFor="lookup-id" className="field__label">Mã đơn hàng</label>
              <input
                id="lookup-id"
                className="input input--block lookup__id"
                placeholder="DH004"
                autoComplete="off"
                value={form.id}
                onChange={update('id')}
                aria-invalid={Boolean(errors.id)}
                aria-describedby={errors.id ? 'lookup-id-error' : undefined}
              />
              {errors.id && <p id="lookup-id-error" className="field__error" role="alert">{errors.id}</p>}
            </div>
            <div>
              <label htmlFor="lookup-phone" className="field__label">Số điện thoại</label>
              <input
                id="lookup-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="input input--block"
                placeholder="0912345678"
                value={form.phone}
                onChange={update('phone')}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'lookup-phone-error' : undefined}
              />
              {errors.phone && <p id="lookup-phone-error" className="field__error" role="alert">{errors.phone}</p>}
            </div>
          </div>
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Đang tìm...' : 'Tra cứu'}</button>
        </form>

        {errors.form && <p className="error" role="alert">{errors.form}</p>}

        {order && (
          <div className="panel lookup__result" role="status">
            <div className="order__head">
              <h2>Đơn #{order.id}</h2>
              <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <dl className="summary">
              <div><dt>Người nhận</dt><dd>{order.customerName}</dd></div>
              <div><dt>Đặt lúc</dt><dd>{formatDateTime(order.createdAt)}</dd></div>
              <div><dt>Số món</dt><dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)} ly</dd></div>
              <div><dt>Thanh toán</dt><dd>{PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}</dd></div>
              <div className="summary__total"><dt>Tổng cộng</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
            <Link to={`/orders/${encodeURIComponent(order.id)}`} className="btn lookup__track">Xem tiến trình</Link>
          </div>
        )}
      </div>
    </section>
  );
}
