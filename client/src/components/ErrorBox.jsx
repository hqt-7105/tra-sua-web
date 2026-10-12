/**
 * Ô báo lỗi dùng chung — C2 (TV2). Thông báo tiếng Việt, nói rõ cách sửa, kèm nút "Thử lại".
 *
 * Ví dụ:
 *   const { data, error, reload } = useFetch('/drinks');
 *   if (error) return <ErrorBox error={error} onRetry={reload} />;
 *   <ErrorBox error={err} title="Không tải được thực đơn" />      // tự đặt tiêu đề
 *   <ErrorBox error={err} compact />                              // gọn, dùng trong ô nhỏ
 *
 * error: Error từ api/client.js. Không có status = không gọi được máy chủ (mất mạng,
 * backend chưa chạy) → gợi ý kiểm tra kết nối. Có status → hiện thông báo server trả về.
 */
export default function ErrorBox({ error, onRetry, title, compact = false }) {
  const offline = error?.status === undefined;
  const heading = title ?? (offline ? 'Không kết nối được máy chủ' : 'Đã có lỗi xảy ra');
  const detail = offline
    ? 'Kiểm tra kết nối mạng rồi thử lại. Nếu đang chạy thử trên máy, hãy bật backend bằng npm run dev.'
    : error?.message;

  return (
    <div className={compact ? 'error-box error-box--compact' : 'error-box'} role="alert">
      <span className="error-box__icon" aria-hidden>⚠️</span>
      <div className="error-box__text">
        <strong>{heading}</strong>
        {detail && <p>{detail}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn--ghost error-box__retry" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
