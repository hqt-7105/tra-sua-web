/** Nhãn tiếng Việt cho trạng thái đơn, thanh toán và tùy chọn món — dùng chung nhiều trang. */

export const ORDER_STEPS = [
  { status: 'PENDING', label: 'Chờ xác nhận' },
  { status: 'PREPARING', label: 'Đang pha chế' },
  { status: 'DELIVERING', label: 'Đang giao' },
  { status: 'COMPLETED', label: 'Hoàn thành' },
];

export const STATUS_LABELS = {
  ...Object.fromEntries(ORDER_STEPS.map((step) => [step.status, step.label])),
  CANCELLED: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Thanh toán khi nhận hàng',
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
};

export const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toán khi nhận hàng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
};

/**
 * { size: 'L', sugar: 50, ice: 70, note } → "Size L · 50% đường · 70% đá · Ghi chú: ít ngọt"
 * Món không chỉnh được đường/đá (ví dụ đá xay) có giá trị null → bỏ phần đó.
 */
export function formatItemOptions({ size, sugar, ice, note }) {
  const parts = [`Size ${size}`];
  if (sugar != null) parts.push(`${sugar}% đường`);
  if (ice != null) parts.push(`${ice}% đá`);
  if (note) parts.push(`Ghi chú: ${note}`);
  return parts.join(' · ');
}

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

/** ISO string → "09:00 12/10/2026" (giờ Việt Nam) */
export const formatDateTime = (value) => dateTime.format(new Date(value));
