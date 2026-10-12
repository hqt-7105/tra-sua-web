import { useEffect, useRef, useState } from 'react';

/**
 * Hook nhận sự kiện đơn hàng theo thời gian thực — TV2 (Sprint 2, Observer phía client).
 *
 * Hợp đồng:
 *   useOrderEvents(url, onEvent)
 *     url:     '/api/orders/DH001/events'  (khách)  hoặc  `/api/admin/events?token=${token}` (admin)
 *              truyền null để tạm không kết nối
 *     onEvent: (event) => void, event có dạng như phía server (type, orderId, status, ...)
 *   - Dùng EventSource, lắng nghe sự kiện tên 'order' (server gửi `event: order`)
 *   - Đóng kết nối khi component unmount hoặc url đổi
 *   - Mất kết nối thì EventSource tự kết nối lại, không cần xử lý thêm
 *   Bổ sung: trả về { connected } để trang báo "đang kết nối lại" khi mất kết nối.
 *
 * Nơi dùng: OrderTracking.jsx (khách), AdminLayout.jsx / AdminOrders.jsx (admin)
 *
 * Ví dụ:
 *   const { connected } = useOrderEvents(apiUrl(`/orders/${id}/events`), (event) => {
 *     if (event.type === 'STATUS_CHANGED') reload();
 *   });
 */
export function useOrderEvents(url, onEvent) {
  const [connected, setConnected] = useState(false);
  // Giữ hàm mới nhất trong ref: đổi onEvent không làm mở lại kết nối.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!url || typeof EventSource === 'undefined') {
      setConnected(false);
      return undefined;
    }
    const source = new EventSource(url);
    const handleOrder = (message) => {
      let event;
      try {
        event = JSON.parse(message.data);
      } catch {
        return; // dữ liệu hỏng: bỏ qua sự kiện này
      }
      onEventRef.current?.(event);
    };
    source.addEventListener('order', handleOrder);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    return () => {
      source.removeEventListener('order', handleOrder);
      source.close();
      setConnected(false);
    };
  }, [url]);

  return { connected };
}
