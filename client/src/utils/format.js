const vnd = new Intl.NumberFormat('vi-VN');

/** 35000 → "35.000đ" */
export const formatPrice = (value) => `${vnd.format(value)}đ`;
