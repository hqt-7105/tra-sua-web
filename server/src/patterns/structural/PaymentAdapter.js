/**
 * ============================================================================
 * PATTERN: Adapter (Structural) — PHỤ TRÁCH: TV3
 * ============================================================================
 * Vấn đề:
 *   Mỗi cổng thanh toán có "giao diện" riêng: MoMo dùng hàm async và mã số
 *   resultCode, VNPay dùng hàm đồng bộ, ném lỗi, và số tiền phải nhân 100;
 *   COD thì không có SDK nào. Nếu OrderFacade gọi thẳng từng SDK thì mỗi lần
 *   thêm cổng mới phải sửa Facade.
 *
 * Giải pháp:
 *   Định nghĩa một interface chung PaymentGateway. Mỗi cổng có một Adapter
 *   bọc SDK riêng và "dịch" về interface chung.
 *
 * Cấu trúc GoF:
 *   Target   = PaymentGateway
 *   Adaptee  = FakeMomoSdk, FakeVnPaySdk   (src/integrations/, ĐÃ CÓ, không sửa)
 *   Adapter  = MomoAdapter, VnPayAdapter, CodAdapter
 *   Client   = OrderFacade (TV1), route /api/payments/confirm
 *
 * Hợp đồng:
 *   gateway.getMethod()        → 'COD' | 'MOMO' | 'VNPAY'
 *   await gateway.pay(order)   → PaymentResult
 *     order: { id, total, ... } (tiền VND)
 *     PaymentResult = { method, status, redirectUrl, message }
 *       COD   → status 'UNPAID',  redirectUrl null
 *       MOMO  → resultCode 0 → 'PENDING' + payUrl;  khác 0 → 'FAILED' + message của MoMo
 *       VNPAY → vnp_Amount = total * 100 → 'PENDING' + url; SDK throw → 'FAILED' + message
 *     pay() KHÔNG bao giờ throw vì lỗi cổng, luôn trả PaymentResult.
 *   await gateway.verify(params) → { orderId, success, transactionId }
 *     params: query mà trang /payment/mock gửi về (chuỗi)
 *     chữ ký sai → throw HttpError(400, 'Chữ ký thanh toán không hợp lệ')
 *     CodAdapter.verify → throw HttpError(400) (COD không có callback)
 *   createPaymentGateway(method) → adapter tương ứng; method lạ → throw HttpError(400)
 *
 * Ví dụ sử dụng:
 *   const gateway = createPaymentGateway('VNPAY');      // Facade không biết đây là VNPay
 *   await gateway.pay({ id: 'DH004', total: 47000 });
 *   // → { method: 'VNPAY', status: 'PENDING', redirectUrl: '/payment/mock?gateway=vnpay&...vnp_Amount=4700000...' }
 *   await createPaymentGateway('MOMO').pay({ id: 'DH005', total: 500 });
 *   // → { method: 'MOMO', status: 'FAILED', redirectUrl: null, message: 'MoMo từ chối giao dịch: Số tiền...' }
 *   await gateway.verify(queryTừCổng);                  // → { orderId: 'DH004', success: true, transactionId }
 *
 * Test chấp nhận: tests/adapter.test.js, tests/payment.test.js (API)
 * ============================================================================
 */
import { FakeMomoSdk } from '../../integrations/FakeMomoSdk.js';
import { FakeVnPaySdk } from '../../integrations/FakeVnPaySdk.js';
import { HttpError } from '../../middlewares/errorHandler.js';

/** Target — interface chung mà Facade sử dụng */
export class PaymentGateway {
  getMethod() {
    throw new Error(`${this.constructor.name} phải cài đặt getMethod()`);
  }

  // eslint-disable-next-line no-unused-vars
  async pay(order) {
    throw new Error(`${this.constructor.name} phải cài đặt pay()`);
  }

  // eslint-disable-next-line no-unused-vars
  async verify(params) {
    throw new Error(`${this.constructor.name} phải cài đặt verify()`);
  }
}

const INVALID_SIGNATURE = 'Chữ ký thanh toán không hợp lệ';

/** PaymentResult theo hợp đồng — mọi adapter trả cùng một dạng. */
const paymentResult = (method, status, redirectUrl, message) => ({ method, status, redirectUrl, message });

/** COD không có SDK: "dịch" thành thanh toán khi nhận hàng, không chuyển trang. */
export class CodAdapter extends PaymentGateway {
  getMethod() {
    return 'COD';
  }

  async pay() {
    return paymentResult('COD', 'UNPAID', null, 'Thanh toán khi nhận hàng');
  }

  async verify() {
    throw new HttpError(400, 'Đơn thanh toán khi nhận hàng không có xác nhận từ cổng thanh toán');
  }
}

export class MomoAdapter extends PaymentGateway {
  /** @param {FakeMomoSdk} sdk */
  constructor(sdk = new FakeMomoSdk()) {
    super();
    this.sdk = sdk;
  }

  getMethod() {
    return 'MOMO';
  }

  /** SDK MoMo: hàm async, tham số tên riêng, kết quả là resultCode số (0 = thành công). */
  async pay(order) {
    const response = await this.sdk.createPayment({
      partnerCode: this.sdk.partnerCode, // mã đối tác cấu hình cùng SDK
      orderId: order.id,
      amount: order.total,
      orderInfo: `Thanh toán đơn ${order.id} - Mây Trà Sữa`,
    });
    if (response.resultCode !== 0) {
      return paymentResult('MOMO', 'FAILED', null, `MoMo từ chối giao dịch: ${response.message}`);
    }
    return paymentResult('MOMO', 'PENDING', response.payUrl, response.message);
  }

  /** Callback MoMo: { valid, resultCode số, transId } → định dạng chung. 1006 = khách hủy. */
  async verify(params) {
    const callback = this.sdk.verifyCallback(params ?? {});
    if (!callback.valid) throw new HttpError(400, INVALID_SIGNATURE);
    return {
      orderId: callback.orderId,
      success: callback.resultCode === 0,
      transactionId: callback.transId,
    };
  }
}

export class VnPayAdapter extends PaymentGateway {
  /** @param {FakeVnPaySdk} sdk */
  constructor(sdk = new FakeVnPaySdk()) {
    super();
    this.sdk = sdk;
  }

  getMethod() {
    return 'VNPAY';
  }

  /** SDK VNPay: hàm đồng bộ, ném lỗi khi sai, số tiền phải nhân 100. */
  async pay(order) {
    try {
      const url = this.sdk.buildPaymentUrl({
        vnp_TxnRef: order.id,
        vnp_Amount: order.total * 100,
        vnp_OrderInfo: `Thanh toan don ${order.id}`,
      });
      return paymentResult('VNPAY', 'PENDING', url, 'Thành công');
    } catch (err) {
      const reason = err.message.replace(/^VNPay:\s*/, '');
      return paymentResult('VNPAY', 'FAILED', null, `VNPay từ chối giao dịch: ${reason}`);
    }
  }

  /** Query VNPay: mã đơn ở vnp_TxnRef, kết quả là chuỗi vnp_ResponseCode ('00' = thành công, '24' = khách hủy). */
  async verify(params) {
    const result = this.sdk.verifyReturnUrl(params ?? {});
    if (!result.isValid) throw new HttpError(400, INVALID_SIGNATURE);
    return {
      orderId: result.vnp_TxnRef,
      success: result.isSuccess,
      transactionId: result.vnp_TransactionNo,
    };
  }
}

/** Phương thức thanh toán → adapter tương ứng. Thêm cổng mới = thêm một adapter + một dòng ở đây. */
const ADAPTER_BY_METHOD = {
  COD: () => new CodAdapter(),
  MOMO: () => new MomoAdapter(),
  VNPAY: () => new VnPayAdapter(),
};

export function createPaymentGateway(method) {
  const create = Object.hasOwn(ADAPTER_BY_METHOD, method) ? ADAPTER_BY_METHOD[method] : null;
  if (!create) {
    throw new HttpError(400, `Không hỗ trợ phương thức thanh toán "${method}"`);
  }
  return create();
}
