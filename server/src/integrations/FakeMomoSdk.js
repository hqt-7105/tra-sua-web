/**
 * SDK MoMo GIẢ LẬP — đóng vai "thư viện bên thứ ba" (Adaptee trong Adapter).
 * ĐÃ CÀI SẴN, KHÔNG SỬA FILE NÀY. TV3 viết MomoAdapter để dùng nó.
 *
 * Cố ý mô phỏng các điểm "không khớp" với interface chung của dự án:
 *   - Hàm bất đồng bộ createPayment(), tham số đặt tên theo MoMo
 *     (partnerCode, orderId, amount, orderInfo, redirectUrl)
 *   - Kết quả là mã số: resultCode 0 = thành công, khác 0 = lỗi
 *   - Callback trả về resultCode 0 (thanh toán xong) hoặc 1006 (khách hủy)
 *
 * Không gọi mạng: payUrl trỏ tới trang cổng thanh toán giả /payment/mock của frontend.
 */
import { createHmac, randomUUID } from 'node:crypto';

const sign = (secret, data) => createHmac('sha256', secret).update(data).digest('hex');

export class FakeMomoSdk {
  constructor({ partnerCode = 'MAYTEA', secretKey = 'momo-demo-secret' } = {}) {
    this.partnerCode = partnerCode;
    this.secretKey = secretKey;
  }

  /**
   * @param {{ partnerCode: string, orderId: string, amount: number, orderInfo?: string, redirectUrl?: string }} req
   * @returns {Promise<{ resultCode: number, message: string, requestId?: string, payUrl?: string }>}
   */
  async createPayment({ partnerCode, orderId, amount, orderInfo = '', redirectUrl = '/payment/mock' }) {
    if (partnerCode !== this.partnerCode) {
      return { resultCode: 11, message: 'Truy cập bị từ chối (sai partnerCode)' };
    }
    if (!orderId) {
      return { resultCode: 20, message: 'Thiếu orderId' };
    }
    if (!Number.isInteger(amount) || amount < 1000 || amount > 50_000_000) {
      return { resultCode: 22, message: 'Số tiền giao dịch không hợp lệ (1.000đ – 50.000.000đ)' };
    }
    const requestId = randomUUID();
    const signature = sign(this.secretKey, `${orderId}|${amount}|${requestId}`);
    const params = new URLSearchParams({
      gateway: 'momo',
      orderId,
      amount: String(amount),
      requestId,
      orderInfo,
      signature,
    });
    return { resultCode: 0, message: 'Thành công', requestId, payUrl: `${redirectUrl}?${params}` };
  }

  /**
   * Kiểm tra dữ liệu cổng gửi về sau khi khách thanh toán.
   * @param {{ orderId, amount, requestId, signature, resultCode, transId }} params (đều là chuỗi)
   * @returns {{ valid: boolean, resultCode: number, orderId: string, amount: number, transId: string|null }}
   */
  verifyCallback({ orderId, amount, requestId, signature, resultCode, transId = null }) {
    const expected = sign(this.secretKey, `${orderId}|${amount}|${requestId}`);
    return {
      valid: signature === expected,
      resultCode: Number(resultCode),
      orderId,
      amount: Number(amount),
      transId,
    };
  }
}
