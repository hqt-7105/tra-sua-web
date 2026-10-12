import { readFileSync } from 'node:fs';

/**
 * Tài khoản nhân viên/quản trị — PHỤ TRÁCH: TV4 (Sprint 2).
 * Đọc từ src/data/users.json (mật khẩu chỉ lưu dạng băm scrypt, BR21).
 *
 * Hợp đồng:
 *   userRepository.findByEmail(email) → { id, email, name, role, passwordHash } | null
 *     email không phân biệt hoa thường, bỏ khoảng trắng hai đầu
 */
const users = JSON.parse(readFileSync(new URL('../data/users.json', import.meta.url), 'utf-8'));

export const userRepository = {
  findByEmail(email) {
    if (typeof email !== 'string') return null;
    const wanted = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === wanted);
    return user ? { ...user } : null;
  },
};
