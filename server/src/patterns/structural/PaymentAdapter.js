/**
 * ============================================================================
 * PATTERN: Adapter (Structural) — PHỤ TRÁCH: TV3          [Sprint 2 - CHƯA LÀM]
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
 * Test chấp nhận: tests/adapter.test.js (bỏ `todo` khi làm xong)
 * ============================================================================
 */
import { FakeMomoSdk } from '../../integrations/FakeMomoSdk.js';
import { FakeVnPaySdk } from '../../integrations/FakeVnPaySdk.js';
// import { HttpError } from '../../middlewares/errorHandler.js';

const todo = (what) => {
  throw new Error(`TODO(TV3): chưa cài ${what}`);
};

/** Target — interface chung mà Facade sử dụng */
export class PaymentGateway {
  getMethod() {
    return todo(`${this.constructor.name}.getMethod()`);
  }

  // eslint-disable-next-line no-unused-vars
  async pay(order) {
    return todo(`${this.constructor.name}.pay()`);
  }

  // eslint-disable-next-line no-unused-vars
  async verify(params) {
    return todo(`${this.constructor.name}.verify()`);
  }
}

// TODO(TV3): cài getMethod / pay / verify cho 3 adapter dưới

export class CodAdapter extends PaymentGateway {}

export class MomoAdapter extends PaymentGateway {
  /** @param {FakeMomoSdk} sdk */
  constructor(sdk = new FakeMomoSdk()) {
    super();
    this.sdk = sdk;
  }
}

export class VnPayAdapter extends PaymentGateway {
  /** @param {FakeVnPaySdk} sdk */
  constructor(sdk = new FakeVnPaySdk()) {
    super();
    this.sdk = sdk;
  }
}

// eslint-disable-next-line no-unused-vars
export function createPaymentGateway(method) {
  return todo('createPaymentGateway()');
}
