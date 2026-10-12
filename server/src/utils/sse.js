/**
 * Mở luồng Server-Sent Events và đăng ký kết nối vào một Observer — TV2 (Sprint 2).
 *
 *   openEventStream(req, res, (stream) => customerStream.addClient(orderId, stream));
 *
 * - addClient(res) phải trả về hàm gỡ kết nối (hợp đồng của các Observer SSE).
 * - Gửi dòng chú thích ': ping' mỗi 25 giây để proxy/trình duyệt không đóng kết nối.
 * - Trình duyệt đóng tab (req 'close') → dừng ping và gỡ khỏi Observer.
 */
export const PING_INTERVAL_MS = 25_000;
/** EventSource tự kết nối lại sau số mili giây này khi mất mạng. */
const RETRY_MS = 3000;

export function openEventStream(req, res, addClient) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write(`retry: ${RETRY_MS}\n\n`);

  const remove = addClient(res);
  const ping = setInterval(() => res.write(': ping\n\n'), PING_INTERVAL_MS);
  req.on('close', () => {
    clearInterval(ping);
    remove();
  });
}
