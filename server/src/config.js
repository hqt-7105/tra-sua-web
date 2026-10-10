/**
 * Cấu hình nghiệp vụ dùng chung. Đổi giá trị ở đây, không viết cứng trong code.
 */
export const config = {
  /** Phí giao hàng cố định (VND) */
  shippingFee: 15000,

  /** Giờ mở cửa theo giờ Việt Nam: nhận đơn từ 08:00 đến trước 22:00 */
  storeHours: { open: 8, close: 22 },
  timezone: 'Asia/Ho_Chi_Minh',

  /** Phương thức thanh toán đang hỗ trợ */
  paymentMethods: ['COD', 'MOMO', 'VNPAY'],

  /** Giới hạn số lượng mỗi dòng món */
  maxQuantityPerItem: 20,

  /** Thời hạn phiên đăng nhập admin (giờ) */
  sessionHours: 8,
};
