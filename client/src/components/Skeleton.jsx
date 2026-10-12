/**
 * Khung xám nhấp nháy khi đang tải — C2 (TV2). Giữ chỗ đúng hình dạng nội dung sắp hiện,
 * trang không bị "nhảy" khi dữ liệu về. Người dùng trình đọc màn hình nghe "Đang tải...".
 *
 * Ví dụ:
 *   const { data, loading } = useFetch('/drinks');
 *   if (loading) return <SkeletonCards count={6} />;           // lưới thẻ món (Menu, Trang chủ)
 *   <SkeletonLines lines={4} />                                 // dòng giỏ hàng, bảng admin
 *   <SkeletonDetail />                                          // trang chi tiết món / đơn hàng
 *   <Skeleton width="60%" height={20} />                        // một khối tùy ý
 *
 * Màu và hiệu ứng ở styles.css (.skeleton); tắt nhấp nháy khi người dùng chọn giảm chuyển động.
 */
export function Skeleton({ width = '100%', height = 16, radius, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden
    />
  );
}

function LoadingRegion({ children, className }) {
  return (
    <div className={className} role="status" aria-busy="true">
      <span className="sr-only">Đang tải...</span>
      {children}
    </div>
  );
}

/** Lưới thẻ món đang tải — cùng bố cục .grid / .card của DrinkCard. */
export function SkeletonCards({ count = 6 }) {
  return (
    <LoadingRegion className="grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton-card" aria-hidden>
          <Skeleton height={180} radius={0} />
          <div className="card__body">
            <Skeleton width="40%" height={14} />
            <Skeleton width="80%" height={20} />
            <Skeleton width="95%" height={14} />
            <div className="skeleton-card__foot">
              <Skeleton width={72} height={20} />
              <Skeleton width={100} height={44} radius={999} />
            </div>
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Các dòng đang tải (giỏ hàng, danh sách, bảng). */
export function SkeletonLines({ lines = 3 }) {
  return (
    <LoadingRegion className="skeleton-lines">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="panel skeleton-line" aria-hidden>
          <div className="skeleton-line__text">
            <Skeleton width="55%" height={18} />
            <Skeleton width="35%" height={14} />
          </div>
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Trang chi tiết đang tải: ảnh + tiêu đề + vài dòng mô tả. */
export function SkeletonDetail() {
  return (
    <LoadingRegion className="detail skeleton-detail">
      <Skeleton height={280} radius={16} />
      <div className="skeleton-detail__text" aria-hidden>
        <Skeleton width={90} height={20} radius={999} />
        <Skeleton width="70%" height={32} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="85%" height={16} />
        <Skeleton width={140} height={26} />
      </div>
    </LoadingRegion>
  );
}
