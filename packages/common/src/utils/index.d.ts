/**
 * 元转分
 * @param yuan - 金额（元）
 * @returns 金额（分），四舍五入
 */
export declare function yuanToFen(yuan: number): number;
/**
 * 分转元字符串
 * 返回字符串避免浮点精度问题
 * @param fen - 金额（分）
 * @returns 金额（元），保留两位小数
 */
export declare function fenToYuan(fen: number): string;
/**
 * 邮箱脱敏
 * 示例：user@example.com → u***r@example.com
 * SECURITY: 单字符 local 部分返回 ***@domain
 *
 * @param email - 邮箱地址
 * @returns 脱敏后的邮箱
 */
export declare function maskEmail(email: string): string;
/**
 * 手机号脱敏
 * 示例：13812345678 → 138****5678
 *
 * @param phone - 手机号
 * @returns 脱敏后的手机号
 */
export declare function maskPhone(phone: string): string;
/**
 * API Key 脱敏
 * 显示前 16 字符 + ...
 * SECURITY: 短于 16 字符的 Key 返回 ****
 *
 * @param key - API Key
 * @returns 脱敏后的 Key
 */
export declare function maskApiKey(key: string): string;
/**
 * 生成订单号
 * 格式：TOAI + 时间戳(Base36) + 随机数(8字符)
 * SECURITY: 使用 crypto.randomBytes 代替 Math.random，保证不可预测
 *
 * @returns 唯一订单号
 */
export declare function generateOrderNo(): string;
/**
 * 计算 Token 费用（分）
 *
 * @param tokenCount - Token 数量
 * @param pricePerMillionTokens - 每百万 Token 价格（分）
 * @returns 费用（分），向上取整
 */
export declare function calculateTokenCost(tokenCount: number, pricePerMillionTokens: number): number;
/**
 * 检查值是否已定义（非 null 且非 undefined）
 */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/**
 * 异步休眠
 *
 * @param ms - 毫秒数
 */
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map