import { Fragment, useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client.js';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorBox from '../../components/ErrorBox.jsx';
import { SkeletonLines } from '../../components/Skeleton.jsx';
import { useToast } from '../../hooks/useToast.js';
import { formatPrice } from '../../utils/format.js';
import {
  ORDER_STEPS,
  STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatItemOptions,
  formatDateTime,
} from '../../utils/orderLabels.js';

/**
 * Quản lý đơn hàng — TV5 (UC10).
 * - Nút thao tác lấy từ allowedActions của đơn (State quyết định), server trả 409 nếu
 *   trạng thái đã đổi ở nơi khác → báo lỗi và tải lại bảng.
 * - Observer (TV2): AdminLayout giữ luồng /api/admin/events; trang này đăng ký qua
 *   onOrderEvent để đơn mới tự xuất hiện ở đầu bảng, trạng thái tự cập nhật.
 */
const FILTERS = [
  { status: '', label: 'Tất cả' },
  ...ORDER_STEPS,
  { status: 'CANCELLED', label: STATUS_LABELS.CANCELLED },
];

/** Nhãn nút "next" theo trạng thái hiện tại (UC10 bước 3). */
const NEXT_LABELS = { PENDING: 'Xác nhận', PREPARING: 'Giao hàng', DELIVERING: 'Hoàn thành' };

function OrderDetail({ order }) {
  return (
    <div className="admin-order">
      <div>
        <h3 className="panel__title">Giao tới</h3>
        <p className="order__line">{order.address}</p>
        {order.note && <p className="order__line muted">Ghi chú: {order.note}</p>}
      </div>
      <div>
        <h3 className="panel__title">Món</h3>
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
        <p className="order__line muted">
          Tạm tính {formatPrice(order.subtotal)} · Ship {formatPrice(order.shippingFee)}
          {order.discount > 0 && ` · Giảm ${formatPrice(order.discount)} (${order.voucherCode})`}
        </p>
      </div>
      <div>
        <h3 className="panel__title">Lịch sử trạng thái</h3>
        {order.history.length === 0 ? (
          <p className="muted">Chưa đổi trạng thái lần nào.</p>
        ) : (
          <ul className="history">
            {order.history.map((h) => (
              <li key={`${h.at}-${h.to}`}>
                <span className="muted">{formatDateTime(h.at)}</span> {STATUS_LABELS[h.from]} →{' '}
                <strong>{STATUS_LABELS[h.to]}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const { onOrderEvent } = useOutletContext();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ orders: null, error: null });
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [freshIds, setFreshIds] = useState(() => new Set());

  const load = useCallback(() => {
    api
      .get(`/admin/orders${status ? `?status=${status}` : ''}`)
      .then((orders) => setState({ orders, error: null }))
      .catch((error) => setState((s) => ({ orders: s.orders, error })));
  }, [status]);

  useEffect(load, [load]);

  // Observer phía client: đơn mới / đổi trạng thái / thanh toán → tải lại bảng, đánh dấu đơn mới.
  useEffect(
    () =>
      onOrderEvent((event) => {
        if (event.type === 'ORDER_CREATED') setFreshIds((ids) => new Set(ids).add(event.orderId));
        load();
      }),
    [onOrderEvent, load],
  );

  const act = async (order, action) => {
    if (action === 'cancel' && !window.confirm(`Hủy đơn ${order.id}? Thao tác này không hoàn tác được.`)) return;
    setBusyId(order.id);
    try {
      const updated = await api.patch(`/admin/orders/${encodeURIComponent(order.id)}/status`, { action });
      toast.show(`Đơn ${updated.id}: ${STATUS_LABELS[updated.status]}`, { type: 'success' });
    } catch (err) {
      toast.show(err.message, { type: 'error', duration: 5000 });
    } finally {
      setBusyId(null);
      load(); // 409: trạng thái đã đổi ở nơi khác → lấy trạng thái mới nhất
    }
  };

  const { orders, error } = state;

  return (
    <>
      <h1>Đơn hàng</h1>
      <div className="tabs" role="tablist" aria-label="Lọc theo trạng thái">
        {FILTERS.map((f) => (
          <button
            key={f.status || 'all'}
            type="button"
            role="tab"
            aria-selected={status === f.status}
            className={status === f.status ? 'tab active' : 'tab'}
            onClick={() => setStatus(f.status)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <ErrorBox error={error} title="Không tải được danh sách đơn" onRetry={load} />}
      {!orders && !error && <SkeletonLines lines={4} />}
      {orders?.length === 0 && <EmptyState compact icon="📭" title="Không có đơn nào ở trạng thái này" />}

      {orders?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Đặt lúc</th>
              <th><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Fragment key={order.id}>
                <tr className={freshIds.has(order.id) ? 'data-table__row--fresh' : undefined}>
                  <td data-label="Mã đơn">
                    <span>
                      <strong>{order.id}</strong>
                      {freshIds.has(order.id) && <span className="tag admin-order__new">Mới</span>}
                    </span>
                  </td>
                  <td data-label="Khách hàng">
                    <span>
                      {order.customerName}
                      <small className="muted data-table__sub">{order.phone}</small>
                    </span>
                  </td>
                  <td data-label="Tổng tiền" className="price">{formatPrice(order.total)}</td>
                  <td data-label="Thanh toán">
                    <span>
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      <small className={`data-table__sub pay pay--${order.paymentStatus.toLowerCase()}`}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      </small>
                    </span>
                  </td>
                  <td data-label="Trạng thái">
                    <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td data-label="Đặt lúc">{formatDateTime(order.createdAt)}</td>
                  <td className="data-table__actions">
                    {order.allowedActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className={action === 'cancel' ? 'btn btn--sm btn--ghost' : 'btn btn--sm'}
                        disabled={busyId === order.id}
                        onClick={() => act(order, action)}
                      >
                        {action === 'cancel' ? 'Hủy' : NEXT_LABELS[order.status]}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="link-btn"
                      aria-expanded={openId === order.id}
                      onClick={() => setOpenId(openId === order.id ? null : order.id)}
                    >
                      {openId === order.id ? 'Ẩn chi tiết' : 'Chi tiết'}
                    </button>
                  </td>
                </tr>
                {openId === order.id && (
                  <tr className="data-table__detail">
                    <td colSpan={7}>
                      <OrderDetail order={order} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
