/** Hiển thị trạng thái tải / lỗi dùng chung. */
export function Loading() {
  return <p className="muted center">Đang tải...</p>;
}

export function ErrorBox({ error }) {
  return (
    <p className="error">
      {error.message}
      {error.status === undefined && ' — Backend đã chạy chưa? (npm run dev)'}
    </p>
  );
}
