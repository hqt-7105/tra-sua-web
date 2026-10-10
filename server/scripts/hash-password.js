// Dùng: node server/scripts/hash-password.js <mật-khẩu>
import { hashPassword } from '../src/utils/password.js';

const password = process.argv[2];
if (!password) {
  console.error('Cách dùng: node server/scripts/hash-password.js <mật-khẩu>');
  process.exit(1);
}
console.log(hashPassword(password));
