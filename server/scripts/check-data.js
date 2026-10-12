// Kiểm tra dữ liệu mẫu trong src/data — TV3 (C3).
// Dùng: npm run check-data -w server   (hoặc node server/scripts/check-data.js)
// Có lỗi thì in danh sách và thoát mã 1; không có lỗi thì in "Dữ liệu hợp lệ".
// Chỉ ĐỌC dữ liệu, không sửa file nào (users.json thuộc TV4).
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DATA_DIR = new URL('../src/data/', import.meta.url);
const PUBLIC_DIR = new URL('../../client/public/', import.meta.url);
/** Định dạng băm của utils/password.js: scrypt$<salt hex>$<hash hex> */
const PASSWORD_HASH_PATTERN = /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;
const isNonNegativeInt = (value) => Number.isInteger(value) && value >= 0;

/** Ghi lỗi cho mọi id xuất hiện quá một lần. */
function checkUniqueIds(records, label, errors) {
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record.id)) errors.push(`${label}: id "${record.id}" bị trùng`);
    seen.add(record.id);
  }
}

/**
 * @param {{ categories, drinks, toppings, users }} data nội dung các file JSON
 * @param {{ imageExists?: (path: string) => boolean }} options
 * @returns {string[]} danh sách lỗi (rỗng = hợp lệ)
 */
export function findDataErrors({ categories, drinks, toppings, users }, { imageExists = () => true } = {}) {
  const errors = [];

  checkUniqueIds(categories, 'categories.json', errors);
  for (const category of categories) {
    if (!isNonEmptyString(category.id)) errors.push('categories.json: có danh mục thiếu id');
    if (!isNonEmptyString(category.name)) errors.push(`categories.json: danh mục "${category.id}" thiếu tên`);
  }

  const categoryIds = new Set(categories.map((c) => c.id));
  checkUniqueIds(drinks, 'drinks.json', errors);
  for (const drink of drinks) {
    const at = `drinks.json "${drink.id}"`;
    if (!isNonEmptyString(drink.id)) errors.push('drinks.json: có món thiếu id');
    if (!isNonEmptyString(drink.name)) errors.push(`${at}: thiếu tên món`);
    if (!categoryIds.has(drink.categoryId)) errors.push(`${at}: categoryId "${drink.categoryId}" không có trong categories.json`);
    if (!isPositiveInt(drink.basePrice)) errors.push(`${at}: basePrice phải là số nguyên dương (VND), đang là ${JSON.stringify(drink.basePrice)}`);
    if (typeof drink.isActive !== 'boolean') errors.push(`${at}: isActive phải là true/false`);
    if (typeof drink.isBestSeller !== 'boolean') errors.push(`${at}: isBestSeller phải là true/false`);
    if (drink.image !== null && !(isNonEmptyString(drink.image) && imageExists(drink.image))) {
      errors.push(`${at}: không tìm thấy ảnh ${JSON.stringify(drink.image)} trong client/public (để null nếu chưa có ảnh)`);
    }
  }

  checkUniqueIds(toppings, 'toppings.json', errors);
  for (const topping of toppings) {
    const at = `toppings.json "${topping.id}"`;
    if (!isNonEmptyString(topping.id)) errors.push('toppings.json: có topping thiếu id');
    if (!isNonEmptyString(topping.name)) errors.push(`${at}: thiếu tên topping`);
    if (!isNonNegativeInt(topping.price)) errors.push(`${at}: giá phải là số nguyên ≥ 0 (VND), đang là ${JSON.stringify(topping.price)}`);
    if (typeof topping.isActive !== 'boolean') errors.push(`${at}: isActive phải là true/false`);
  }

  checkUniqueIds(users, 'users.json', errors);
  for (const user of users) {
    const at = `users.json "${user.email ?? user.id}"`;
    if ('password' in user) errors.push(`${at}: có trường "password" (mật khẩu thô), chỉ được lưu passwordHash`);
    if (!PASSWORD_HASH_PATTERN.test(String(user.passwordHash))) {
      errors.push(`${at}: passwordHash không đúng định dạng scrypt$<salt>$<hash> (tạo bằng scripts/hash-password.js)`);
    }
  }

  return errors;
}

function loadJson(file) {
  return JSON.parse(readFileSync(new URL(file, DATA_DIR), 'utf-8'));
}

function main() {
  const data = {
    categories: loadJson('categories.json'),
    drinks: loadJson('drinks.json'),
    toppings: loadJson('toppings.json'),
    users: loadJson('users.json'),
  };
  // Ảnh "/images/drinks/x.svg" nằm ở client/public/images/drinks/x.svg
  const imageExists = (path) => existsSync(fileURLToPath(new URL(path.replace(/^\//, ''), PUBLIC_DIR)));
  const errors = findDataErrors(data, { imageExists });

  if (errors.length > 0) {
    console.error(`Dữ liệu có ${errors.length} lỗi:`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }
  const { categories, drinks, toppings, users } = data;
  console.log(
    `Dữ liệu hợp lệ: ${categories.length} danh mục, ${drinks.length} món, ${toppings.length} topping, ${users.length} tài khoản.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
