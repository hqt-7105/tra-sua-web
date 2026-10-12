/** Lỗi nghiệp vụ có mã HTTP, ví dụ: throw new HttpError(400, 'Mã giảm giá đã hết hạn') */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: `Không tìm thấy: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: err.message || 'Lỗi máy chủ',
    ...(err.field ? { field: err.field } : {}), // ValidationError: ô dữ liệu bị sai
  });
}
