import { useSearchParams } from 'react-router-dom';
import TaskNotice from '../components/TaskNotice.jsx';

/**
 * Cổng thanh toán GIẢ LẬP — TV3 (Sprint 2).
 * SDK giả (server/src/integrations) tạo link dẫn tới trang này kèm tham số của
 * từng cổng (?gateway=momo&orderId=...  hoặc ?gateway=vnpay&vnp_TxnRef=...).
 */
export default function PaymentMock() {
  const [params] = useSearchParams();
  const gateway = params.get('gateway');

  return (
    <div className="mock-gateway">
      <div className="mock-gateway__card">
        <p className="mock-gateway__brand">{gateway === 'vnpay' ? 'VNPay' : gateway === 'momo' ? 'Ví MoMo' : 'Cổng thanh toán'} · Môi trường thử nghiệm</p>

        <TaskNotice sprint={2} owner="TV3" task="Màn hình cổng thanh toán giả" pattern="Adapter">
          <ul>
            <li>Hiện mã đơn và số tiền đọc từ query (VNPay: <code>vnp_Amount / 100</code>)</li>
            <li>Nút &quot;Thanh toán thành công&quot;: thêm <code>resultCode=0&amp;transId=...</code> (MoMo) hoặc <code>vnp_ResponseCode=00&amp;vnp_TransactionNo=...</code> (VNPay)</li>
            <li>Nút &quot;Hủy giao dịch&quot;: <code>resultCode=1006</code> (MoMo) hoặc <code>vnp_ResponseCode=24</code> (VNPay)</li>
            <li>Gọi <code>POST /api/payments/confirm</code> với <code>{'{ gateway, params }'}</code>, xong chuyển về <code>/orders/:id</code></li>
          </ul>
        </TaskNotice>

        <details>
          <summary className="muted">Tham số nhận được</summary>
          <pre className="mock-gateway__params">{JSON.stringify(Object.fromEntries(params), null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
