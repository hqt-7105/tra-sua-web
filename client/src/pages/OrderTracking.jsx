import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, apiUrl } from '../api/client.js';
import { useOrderEvents } from '../hooks/useOrderEvents.js';
import { useToast } from '../hooks/useToast.js';
import ErrorBox from '../components/ErrorBox.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonLines } from '../components/Skeleton.jsx';
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

/** Thông báo nổi khi đơn đổi trạng thái / cổng thanh toán báo về (Observer). */
const STATUS_MESSAGES = {
  PREPARING: 'Đơn của bạn đang được pha chế',
  DELIVERING: 'Đơn đang trên đường giao tới bạn',
  COMPLETED: 'Đơn đã giao xong. Chúc bạn ngon miệng!',
  CANCELLED: 'Đơn của bạn đã bị hủy',
};
const PAYMENT_MESSAGES = {
  PAID: 'Đã nhận thanh toán. Cảm ơn bạn!',
  FAILED: 'Thanh toán không thành công, đơn đã bị hủy',
};

function messageFor(event) {
  if (event.type === 'STATUS_CHANGED') return STATUS_MESSAGES[event.to ?? event.status];
  if (event.type === 'PAYMENT_UPDATED') return PAYMENT_MESSAGES[event.paymentStatus];
  return null;
}

const isBadNews = (event) => event.paymentStatus === 'FAILED' || event.status === 'CANCELLED';

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

  // Observer phía client: server đẩy sự kiện của đơn này qua SSE → tải lại đơn, không cần F5.
  const toast = useToast();
  const { connected } = useOrderEvents(apiUrl(`/orders/${encodeURIComponent(id)}/events`), (event) => {
    if (event.orderId !== id) return;
    load();
    const message = messageFor(event);
    if (message) toast.show(message, { type: isBadNews(event) ? 'error' : 'success' });
  });

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
        <div className="container narrow">
          <h1>Đơn hàng #{id}</h1>
          {loadError.status === 404 ? (
            <EmptyState icon="🔍" title="Không tìm thấy đơn" actionLabel="Tra cứu đơn hàng" actionTo="/orders/lookup">
              Bạn kiểm tra lại mã đơn, hoặc tra cứu bằng mã đơn và số điện thoại.
            </EmptyState>
          ) : (
            <ErrorBox error={loadError} title="Không tải được đơn hàng" onRetry={load} />
          )}
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="section">
        <div className="container narrow">
          <SkeletonLines lines={3} />
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
        <p className="muted order__meta">
          Đặt lúc {formatDateTime(order.createdAt)}
          <span className={connected ? 'live' : 'live live--off'}>
            {connected ? 'Tự cập nhật' : 'Đang kết nối lại...'}
          </span>
        </p>

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

      </div>
    </section>
  );
}
