/**
 * Express 4 không tự chuyển lỗi của hàm async tới errorHandler (promise bị từ chối
 * sẽ treo request). Bọc route async bằng hàm này:
 *   router.post('/', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
