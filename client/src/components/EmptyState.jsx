import { Link } from 'react-router-dom';

/**
 * Trạng thái rỗng dùng chung — C2 (TV2): nói rõ vì sao trống và gợi ý việc làm tiếp.
 *
 * Ví dụ:
 *   <EmptyState icon="🧋" title="Giỏ hàng đang trống" actionLabel="Xem menu" actionTo="/menu">
 *     Chọn một ly trà sữa thật ngon nhé!
 *   </EmptyState>
 *   <EmptyState icon="🔍" title="Không tìm thấy món phù hợp"
 *     actionLabel="Xem tất cả món" onAction={() => setKeyword('')} />
 *   <EmptyState compact title="Không có đơn nào ở trạng thái này" />   // không nút, gọn
 *
 * Có actionTo → nút là Link chuyển trang; có onAction → nút bấm gọi hàm.
 */
export default function EmptyState({ icon = '🧋', title, children, actionLabel, actionTo, onAction, compact = false }) {
  return (
    <div className={compact ? 'empty-state empty-state--compact' : 'empty-state'}>
      <p className="empty-state__icon" aria-hidden>{icon}</p>
      <p className="empty-state__title">{title}</p>
      {children && <p className="muted empty-state__text">{children}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn">{actionLabel}</Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button type="button" className="btn" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
