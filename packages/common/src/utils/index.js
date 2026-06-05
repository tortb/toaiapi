import { randomBytes } from 'crypto';
/**
 * 元转分
 * @param yuan - 金额（元）
 * @returns 金额（分），四舍五入
 */
export function yuanToFen(yuan) {
    return Math.round(yuan * 100);
}
/**
 * 分转元字符串
 * 返回字符串避免浮点精度问题
 * @param fen - 金额（分）
 * @returns 金额（元），保留两位小数
 */
export function fenToYuan(fen) {
    return (fen / 100).toFixed(2);
}
/**
 * 邮箱脱敏
 * 示例：user@example.com → u***r@example.com
 * SECURITY: 单字符 local 部分返回 ***@domain
 *
 * @param email - 邮箱地址
 * @returns 脱敏后的邮箱
 */
export function maskEmail(email) {
    const [local, domain] = email.split('@');
    if (!local || !domain)
        return '***';
    if (local.length <= 1)
        return `***@${domain}`;
    if (local.length === 2)
        return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
/**
 * 手机号脱敏
 * 示例：13812345678 → 138****5678
 *
 * @param phone - 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}
/**
 * API Key 脱敏
 * 显示前 16 字符 + ...
 * SECURITY: 短于 16 字符的 Key 返回 ****
 *
 * @param key - API Key
 * @returns 脱敏后的 Key
 */
export function maskApiKey(key) {
    if (!key || key.length < 16)
        return '****';
    return key.substring(0, 16) + '...';
}
/**
 * 生成订单号
 * 格式：TOAI + 时间戳(Base36) + 随机数(8字符)
 * SECURITY: 使用 crypto.randomBytes 代替 Math.random，保证不可预测
 *
 * @returns 唯一订单号
 */
export function generateOrderNo() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `TOAI${timestamp}${random}`;
}
/**
 * 计算 Token 费用（分）
 *
 * @param tokenCount - Token 数量
 * @param pricePerMillionTokens - 每百万 Token 价格（分）
 * @returns 费用（分），向上取整
 */
export function calculateTokenCost(tokenCount, pricePerMillionTokens) {
    return Math.ceil((tokenCount / 1_000_000) * pricePerMillionTokens);
}
/**
 * 检查值是否已定义（非 null 且非 undefined）
 */
export function isDefined(value) {
    return value !== null && value !== undefined;
}
/**
 * 异步休眠
 *
 * @param ms - 毫秒数
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=index.js.map