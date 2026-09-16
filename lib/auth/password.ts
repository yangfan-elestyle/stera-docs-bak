import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt 走 node:crypto, 不引第三方: 依赖越少, 运行期越不会因为原生模块 ABI 出问题。
// 参数用 Node 默认 (N=16384, r=8, p=1), 单次约 50~100ms, 对「个位数编辑者」的登录频次足够。
const KEY_LEN = 64;
const SALT_LEN = 32;
const PREFIX = 'scrypt';

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(password.normalize('NFKC'), salt, KEY_LEN);
  return `${PREFIX}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [prefix, saltHex, keyHex] = stored.split('$');
  if (prefix !== PREFIX || !saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = scryptSync(
    password.normalize('NFKC'),
    Buffer.from(saltHex, 'hex'),
    expected.length,
  );
  // 长度不等时 timingSafeEqual 会抛, 先挡一道
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// 弱口令 = 拿到服务端代码执行权, 门槛按此定, 不是按「普通后台」定。
export const PASSWORD_MIN_LENGTH = 12;

export function checkPasswordStrength(password: string): string | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `密码至少 ${PASSWORD_MIN_LENGTH} 位`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return '密码需同时包含大写字母、小写字母与数字';
  }
  return undefined;
}
