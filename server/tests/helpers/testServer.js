// Tiện ích cho test API: mở app ở cổng ngẫu nhiên và gọi bằng fetch.
// File nằm trong tests/helpers/ (không có đuôi .test.js) nên node --test không chạy nó như một bộ test.
import { createApp } from '../../src/app.js';

/** Tài khoản demo trong src/data/users.json. */
export const DEMO_ACCOUNTS = {
  admin: { email: 'admin@may.vn', password: 'admin123' },
  staff: { email: 'staff@may.vn', password: 'staff123' },
};

export async function startTestServer() {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  const call = async (method, path, body, headers = {}) => {
    const res = await fetch(baseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { status: res.status, body: json, headers: res.headers };
  };

  /** Đăng nhập tài khoản demo, trả header Authorization để gửi kèm request admin. */
  const loginAs = async (role) => {
    const account = DEMO_ACCOUNTS[role];
    const { status, body } = await call('POST', '/admin/login', account);
    if (status !== 200) throw new Error(`Đăng nhập ${role} thất bại: ${status}`);
    return { Authorization: `Bearer ${body.token}` };
  };

  return {
    baseUrl,
    loginAs,
    close: () => new Promise((resolve) => server.close(resolve)),
    get: (path, headers) => call('GET', path, undefined, headers),
    post: (path, body, headers) => call('POST', path, body, headers),
    put: (path, body, headers) => call('PUT', path, body, headers),
    patch: (path, body, headers) => call('PATCH', path, body, headers),
    delete: (path, headers) => call('DELETE', path, undefined, headers),
  };
}
