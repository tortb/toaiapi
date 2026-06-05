import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
/**
 * AES-256-GCM 加密工具
 *
 * 用于加密存储敏感数据（如 Channel API Key）。
 * SECURITY: 使用 AES-256-GCM 认证加密，保证机密性和完整性。
 *
 * 格式：Base64(IV[12] + AuthTag[16] + Ciphertext)
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
/**
 * 获取加密密钥
 * 从环境变量 ENCRYPTION_KEY 读取，支持 hex 或 utf-8 格式，必须为 32 字节
 *
 * @returns 32 字节的加密密钥
 * @throws 环境变量未配置或长度不足
 */
function getEncryptionKey() {
    const key = process.env['ENCRYPTION_KEY'];
    if (!key) {
        throw new Error('[SECURITY] ENCRYPTION_KEY 未配置！请在 .env 中设置 32 字节密钥（推荐 hex 格式：openssl rand -hex 32）');
    }
    // 尝试 hex 解码（推荐格式：64 个 hex 字符 = 32 字节）
    const hexMatch = key.match(/^[0-9a-fA-F]{64}$/);
    if (hexMatch) {
        return Buffer.from(key, 'hex');
    }
    // 回退到 utf-8，按字节长度截取
    const keyBuffer = Buffer.from(key, 'utf-8');
    if (keyBuffer.length < 32) {
        throw new Error(`[SECURITY] ENCRYPTION_KEY 字节长度不足 32，当前: ${keyBuffer.length}。推荐使用 hex 格式：openssl rand -hex 32`);
    }
    return keyBuffer.subarray(0, 32);
}
/**
 * 使用 AES-256-GCM 加密文本
 *
 * @param plaintext - 明文
 * @returns Base64 编码的密文（包含 IV 和 AuthTag）
 * @throws ENCRYPTION_KEY 未配置
 */
export function encrypt(plaintext) {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf-8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    // 格式：IV + AuthTag + Ciphertext
    const result = Buffer.concat([iv, authTag, encrypted]);
    return result.toString('base64');
}
/**
 * 使用 AES-256-GCM 解密密文
 *
 * @param ciphertext - Base64 编码的密文
 * @returns 解密后的明文
 * @throws ENCRYPTION_KEY 未配置或密文被篡改
 */
export function decrypt(ciphertext) {
    const key = getEncryptionKey();
    const data = Buffer.from(ciphertext, 'base64');
    if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
        throw new Error('密文格式无效');
    }
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf-8');
}
/**
 * 脱敏显示 API Key
 * 显示前 8 字符和后 4 字符，中间用 **** 替代
 *
 * @param apiKey - 原始 API Key
 * @returns 脱敏后的字符串
 */
export function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 16) {
        return '****';
    }
    return `${apiKey.slice(0, 8)}****${apiKey.slice(-4)}`;
}
//# sourceMappingURL=crypto.util.js.map