import * as argon2 from 'argon2';

/**
 * Argon2id 配置参数
 *
 * - type: argon2id（推荐的变体，结合了 argon2i 和 argon2d 的优点）
 * - memoryCost: 65536 KB (64 MB) — 内存开销，越高越安全
 * - timeCost: 3 — 迭代次数
 * - parallelism: 4 — 并行度
 *
 * 参考：https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 4,
};

/**
 * 使用 Argon2id 哈希密码
 *
 * @param password - 明文密码
 * @returns Argon2id 哈希字符串
 * @throws 内存不足时可能抛出异常
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('密码不能为空');
  }
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * 验证密码是否匹配哈希
 *
 * @param hash - Argon2id 哈希（数据库中存储的）
 * @param password - 明文密码（用户输入的）
 * @returns 是否匹配
 * @throws 哈希格式无效时可能抛出异常
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

/**
 * 密码强度验证结果
 */
export interface PasswordStrengthResult {
  /** 是否通过验证 */
  valid: boolean;
  /** 未满足的条件列表 */
  errors: string[];
}

/**
 * 验证密码强度
 *
 * 规则：
 * - 长度 8-128 字符
 * - 至少一个大写字母
 * - 至少一个小写字母
 * - 至少一个数字
 *
 * @param password - 待验证的密码
 * @returns 验证结果
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码长度至少 8 个字符');
  }
  if (password.length > 128) {
    errors.push('密码长度不能超过 128 个字符');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
