import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import TaskNotice from '../components/TaskNotice.jsx';
import { Loading } from '../components/Status.jsx';
import { formatPrice } from '../utils/format.js';
import {
  ORDER_STEPS,
  STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatItemOptions,
  formatDateTime,
} from '../utils/orderLabels.js';

const ACTION_LABELS = { next: 'Chuyển bước tiếp', cancel: 'Hủy đơn' };

function ProgressSteps({ status }) {
  const current = ORDER_STEPS.findIndex((step) => step.status === status);
  return (
    <ol className={status === 'CANCELLED' ? 'steps steps--cancelled' : 'steps'}>
      {ORDER_STEPS.map((step, i) => {
        let className = 'steps__item';
        if (i < current) className += ' done';
        if (i === current) className += ' active';
        return (
          <li key={step.status} className={className} aria-current={i === current ? 'step' : undefined}>
            <span className="steps__dot">{i < current ? '✓' : i + 1}</span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);
    api
      .get(`/orders/${encodeURIComponent(id)}`)
      .then(setOrder)
      .catch(setLoadError);
  }, [id]);

  useEffect(load, [load]);

  const changeStatus = async (action) => {
    setBusy(true);
    setActionError('');
    try {
      setOrder(await api.patch(`/orders/${encodeURIComponent(id)}/status`, { action }));
    } catch (err) {
      setActionError(err.message);
      if (err.status === 409) load(); // trạng thái đã đổi ở nơi khác → tải lại
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <section className="section">
        <div className="container narrow center">
          <h1>Đơn hàng #{id}</h1>
          <p className="error">
            {loadError.status === 404 ? 'Không tìm thấy đơn. Bạn kiểm tra lại mã đơn nhé.' : loadError.message}
          </p>
          <Link to="/menu" className="btn">Về Menu</Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="section">
        <div className="container narrow">
          <Loading />
        </div>
      </section>
    );
  }

  const cancelled = order.status === 'CANCELLED';

  return (
    <section className="section">
      <div className="container narrow">
        <div className="order__head">
          <h1>Đơn hàng #{order.id}</h1>
          <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="muted">Đặt lúc {formatDateTime(order.createdAt)}</p>

        <ProgressSteps status={order.status} />
        {cancelled && <p className="error">Đơn đã bị hủy.</p>}

        <div className="order__grid">
          <div className="panel">
            <h2 className="panel__title">Giao tới</h2>
            <p className="order__line"><strong>{order.customerName}</strong> · {order.phone}</p>
            <p className="order__line">{order.address}</p>
            {order.note && <p className="order__line muted">Ghi chú: {order.note}</p>}
          </div>
          <div className="panel">
            <h2 className="panel__title">Thanh toán</h2>
            <p className="order__line">{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            <p className={`order__line pay pay--${order.paymentStatus.toLowerCase()}`}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </p>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel__title">Món đã đặt</h2>
          <ul className="order-items">
            {order.items.map((item, i) => (
              <li key={`${item.drinkId}-${i}`} className="order-items__row">
                <div>
                  <strong>{item.quantity} × {item.description}</strong>
                  <p className="muted">{formatItemOptions(item)}</p>
                </div>
                <span className="price">{formatPrice(item.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <dl className="summary">
            <div><dt>Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div><dt>Phí giao hàng</dt><dd>{formatPrice(order.shippingFee)}</dd></div>
            {order.discount > 0 && (
              <div><dt>Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ''}</dt><dd>−{formatPrice(order.discount)}</dd></div>
            )}
            <div className="summary__total"><dt>Tổng cộng</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </div>

        {order.history.length > 0 && (
          <div className="panel">
            <h2 className="panel__title">Lịch sử trạng thái</h2>
            <ul className="history">
              {order.history.map((h) => (
                <li key={`${h.at}-${h.to}`}>
                  <span className="muted">{formatDateTime(h.at)}</span> {STATUS_LABELS[h.from]} → <strong>{STATUS_LABELS[h.to]}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {order.allowedActions.length > 0 && (
          <div className="panel panel--dashed">
            <h2 className="panel__title">Thử chuyển trạng thái (demo)</h2>
            <div className="order__actions">
              {order.allowedActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className={action === 'cancel' ? 'btn btn--ghost' : 'btn'}
                  disabled={busy}
                  onClick={() => changeStatus(action)}
                >
                  {ACTION_LABELS[action]}
                </button>
              ))}
            </div>
          </div>
        )}
        {actionError && <p className="error" role="alert">{actionError}</p>}

        <TaskNotice sprint={2} owner="TV2" task="Tự cập nhật khi đơn đổi trạng thái (Sprint 2)" pattern="Observer">
          <ul>
            <li>Dùng <code>useOrderEvents(`/api/orders/${'{id}'}/events`, ...)</code>: có sự kiện thì cập nhật thanh tiến trình, không cần tải lại trang</li>
            <li>Hiện toast &quot;Đơn của bạn đang được pha chế&quot;... theo trạng thái mới, và trạng thái thanh toán khi cổng báo về</li>
          </ul>
        </TaskNotice>
      </div>
    </section>
  );
}
