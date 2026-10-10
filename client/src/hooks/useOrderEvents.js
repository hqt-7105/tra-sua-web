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
 *
 * Nơi dùng: OrderTracking.jsx (khách), AdminOrders.jsx (admin)
 */
// eslint-disable-next-line no-unused-vars
export function useOrderEvents(url, onEvent) {
  // TODO(TV2): useEffect(() => { const source = new EventSource(url); ... return () => source.close(); }, [url]);
}
