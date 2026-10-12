/**
 * Gọi API backend. Mọi lời gọi đi qua đây để xử lý lỗi thống nhất.
 * Dev: Vite proxy /api → http://localhost:3001 (xem vite.config.js).
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'may-admin-token';

/** Đường dẫn đầy đủ tới API, dùng cho EventSource (SSE) vốn không đi qua request(). */
export const apiUrl = (path) => BASE_URL + path;

/** Token đăng nhập admin (TV4 lưu sau khi đăng nhập). Bọc try/catch vì localStorage có thể bị chặn. */
export const adminToken = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* bỏ qua */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* bỏ qua */
    }
  },
};

async function request(path, { headers, ...options } = {}) {
  const token = adminToken.get();
  const res = await fetch(BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && path.startsWith('/admin') ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(body?.error || `Lỗi ${res.status}`);
    error.status = res.status;
    error.owner = body?.owner; // API chưa cài (501) sẽ cho biết ai phụ trách
    error.field = body?.field; // lỗi kiểm tra dữ liệu (400) cho biết ô nào sai
    throw error;
  }
  return body;
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
