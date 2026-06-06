import type { TokenUsage, ModelPricing, BillingResult } from './types';
/**
 * 计算 Token 使用费用
 *
 * 费用公式：
 * cost = ceil(
 *   promptTokens * inputPrice / 1_000_000 +
 *   completionTokens * outputPrice / 1_000_000 +
 *   cachedTokens * cachedPrice / 1_000_000 +
 *   reasoningTokens * reasoningPrice / 1_000_000
 * ) * multiplier
 *
 * 所有费用单位：元（CNY），使用 Math.ceil 向上取整
 * SECURITY: 使用 ?? 运算符处理可选价格字段，避免 0 值被错误替换
 *
 * @param usage - Token 使用统计
 * @param pricing - 模型定价（元/百万Token）
 * @returns 计费结果（总费用 + 分项费用）
 * @throws 负数 token 数量或负数价格时行为未定义
 */
export declare function calculateCost(usage: TokenUsage, pricing: ModelPricing): BillingResult;
/**
 * 计算订阅配额使用费用
 *
 * @param tokenCount - Token 数量
 * @param pricePerMillionTokens - 每百万 Token 价格（元）
 * @returns 费用（元），向上取整
 */
export declare function calculateQuotaCost(tokenCount: number, pricePerMillionTokens: number): number;
//# sourceMappingURL=calculator.d.ts.map