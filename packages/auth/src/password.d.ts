/**
 * 使用 Argon2id 哈希密码
 *
 * @param password - 明文密码
 * @returns Argon2id 哈希字符串
 * @throws 内存不足时可能抛出异常
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * 验证密码是否匹配哈希
 *
 * @param hash - Argon2id 哈希（数据库中存储的）
 * @param password - 明文密码（用户输入的）
 * @returns 是否匹配
 * @throws 哈希格式无效时可能抛出异常
 */
export declare function verifyPassword(hash: string, password: string): Promise<boolean>;
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
export declare function validatePasswordStrength(password: string): PasswordStrengthResult;
//# sourceMappingURL=password.d.ts.map