import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { formatPrice } from '../utils/format.js';

/**
 * Cổng thanh toán GIẢ LẬP — TV3 (Sprint 2).
 * SDK giả (server/src/integrations) tạo link dẫn tới trang này kèm tham số của
 * từng cổng (?gateway=momo&orderId=...  hoặc ?gateway=vnpay&vnp_TxnRef=...).
 * Trang gửi lại toàn bộ query kèm kết quả tới POST /api/payments/confirm; server
 * dùng Adapter của cổng tương ứng để kiểm tra chữ ký và đọc kết quả.
 */
const GATEWAYS = {
  momo: {
    name: 'Ví MoMo',
    // MoMo: mã đơn ở orderId, số tiền giữ nguyên VND, kết quả là resultCode số.
    read: (q) => ({ orderId: q.orderId, amount: Number(q.amount) }),
    result: (success) =>
      success ? { resultCode: '0', transId: `MM${Date.now()}` } : { resultCode: '1006' },
  },
  vnpay: {
    name: 'VNPay',
    // VNPay: mã đơn ở vnp_TxnRef, số tiền đã nhân 100, kết quả là chuỗi vnp_ResponseCode.
    read: (q) => ({ orderId: q.vnp_TxnRef, amount: Number(q.vnp_Amount) / 100 }),
    result: (success) =>
      success
        ? { vnp_ResponseCode: '00', vnp_TransactionNo: String(Date.now()).slice(-8) }
        : { vnp_ResponseCode: '24' },
  },
};

export default function PaymentMock() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const query = Object.fromEntries(searchParams);
  const gateway = GATEWAYS[query.gateway];
  const transaction = gateway?.read(query);
  const valid = Boolean(transaction?.orderId) && Number.isInteger(transaction?.amount) && transaction.amount > 0;

  const finish = async (success) => {
    setBusy(success ? 'success' : 'cancel');
    setError('');
    try {
      const result = await api.post('/payments/confirm', {
        gateway: query.gateway,
        params: { ...query, ...gateway.result(success) },
      });
      navigate(`/orders/${encodeURIComponent(result.orderId)}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(null);
    }
  };

  return (
    <div className="mock-gateway">
      <div className="mock-gateway__card">
        <p className="mock-gateway__brand">
          {gateway?.name ?? 'Cổng thanh toán'} · <span className="muted">Môi trường thử nghiệm</span>
        </p>

        {valid ? (
          <>
            <h1 className="mock-gateway__title">Xác nhận thanh toán</h1>
            <dl className="summary mock-gateway__info">
              <div><dt>Đơn hàng</dt><dd>#{transaction.orderId}</dd></div>
              <div><dt>Người nhận</dt><dd>Mây Trà Sữa</dd></div>
              <div className="summary__total"><dt>Số tiền</dt><dd>{formatPrice(transaction.amount)}</dd></div>
            </dl>
            <p className="muted">
              Đây là cổng giả lập để demo, không trừ tiền thật. Chọn kết quả giao dịch:
            </p>
            <div className="mock-gateway__actions">
              <button type="button" className="btn btn--lg" disabled={busy !== null} onClick={() => finish(true)}>
                {busy === 'success' ? 'Đang xử lý...' : 'Thanh toán thành công'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                disabled={busy !== null}
                onClick={() => finish(false)}
              >
                {busy === 'cancel' ? 'Đang hủy...' : 'Hủy giao dịch'}
              </button>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </>
        ) : (
          <>
            <h1 className="mock-gateway__title">Không đọc được giao dịch</h1>
            <p className="error" role="alert">
              Thiếu hoặc sai thông tin giao dịch. Bạn quay lại cửa hàng và đặt lại đơn nhé.
            </p>
            <Link to="/" className="btn">Về trang chủ</Link>
          </>
        )}

        <details className="mock-gateway__details">
          <summary className="muted">Tham số cổng gửi kèm (để xem Adapter dịch gì)</summary>
          <pre className="mock-gateway__params">{JSON.stringify(query, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
