/**
 * SDK VNPay GIẢ LẬP — đóng vai "thư viện bên thứ ba" (Adaptee trong Adapter).
 * ĐÃ CÀI SẴN, KHÔNG SỬA FILE NÀY. TV3 viết VnPayAdapter để dùng nó.
 *
 * Khác MoMo ở nhiều điểm (đúng như cổng thật), Adapter phải che đi:
 *   - Hàm ĐỒNG BỘ buildPaymentUrl(), ném lỗi (throw) thay vì trả mã lỗi
 *   - Tham số tiền vnp_Amount phải NHÂN 100 (47.000đ → 4700000)
 *   - Mã đơn nằm trong vnp_TxnRef; kết quả là chuỗi vnp_ResponseCode '00' = thành công,
 *     '24' = khách hủy
 *
 * Không gọi mạng: URL trỏ tới trang cổng thanh toán giả /payment/mock của frontend.
 */
import { createHmac } from 'node:crypto';

const SIGNED_FIELDS = ['vnp_Amount', 'vnp_OrderInfo', 'vnp_TmnCode', 'vnp_TxnRef'];
const sign = (secret, data) => createHmac('sha512', secret).update(data).digest('hex');
const canonical = (obj) =>
  new URLSearchParams(SIGNED_FIELDS.map((key) => [key, String(obj[key] ?? '')])).toString();

export class FakeVnPaySdk {
  constructor({ tmnCode = 'MAYTEA01', hashSecret = 'vnpay-demo-secret' } = {}) {
    this.tmnCode = tmnCode;
    this.hashSecret = hashSecret;
  }

  /**
   * @param {{ vnp_TxnRef: string, vnp_Amount: number, vnp_OrderInfo?: string, vnp_ReturnUrl?: string }} req
   * @returns {string} URL thanh toán
   * @throws Error khi tham số sai
   */
  buildPaymentUrl({ vnp_TxnRef, vnp_Amount, vnp_OrderInfo = '', vnp_ReturnUrl = '/payment/mock' }) {
    if (!vnp_TxnRef) throw new Error('VNPay: thiếu vnp_TxnRef');
    if (!Number.isInteger(vnp_Amount) || vnp_Amount <= 0 || vnp_Amount % 100 !== 0) {
      throw new Error('VNPay: vnp_Amount phải là số tiền nhân 100');
    }
    if (vnp_Amount < 500_000) throw new Error('VNPay: số tiền tối thiểu 5.000đ');

    const params = { vnp_TmnCode: this.tmnCode, vnp_TxnRef, vnp_Amount, vnp_OrderInfo };
    const query = canonical(params);
    const vnp_SecureHash = sign(this.hashSecret, query);
    return `${vnp_ReturnUrl}?gateway=vnpay&${query}&vnp_SecureHash=${vnp_SecureHash}`;
  }

  /**
   * Kiểm tra query cổng trả về.
   * @param {object} query các tham số vnp_* (chuỗi)
   * @returns {{ isValid: boolean, isSuccess: boolean, vnp_TxnRef: string, vnp_Amount: number,
   *            vnp_TransactionNo: string|null, vnp_ResponseCode: string }}
   */
  verifyReturnUrl(query) {
    const expected = sign(this.hashSecret, canonical(query));
    return {
      isValid: query.vnp_SecureHash === expected && query.vnp_TmnCode === this.tmnCode,
      isSuccess: query.vnp_ResponseCode === '00',
      vnp_TxnRef: query.vnp_TxnRef,
      vnp_Amount: Number(query.vnp_Amount),
      vnp_TransactionNo: query.vnp_TransactionNo ?? null,
      vnp_ResponseCode: query.vnp_ResponseCode,
    };
  }
}
