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
export function calculateCost(usage, pricing) {
    // SECURITY: 校验输入（拒绝负数）
    if (usage.promptTokens < 0 || usage.completionTokens < 0) {
        throw new Error('Token 数量不能为负数');
    }
    if (usage.cachedTokens < 0 || usage.reasoningTokens < 0) {
        throw new Error('Token 数量不能为负数');
    }
    if (pricing.inputPrice < 0 || pricing.outputPrice < 0) {
        throw new Error('价格不能为负数');
    }
    const inputCost = Math.ceil((usage.promptTokens / 1_000_000) * pricing.inputPrice);
    const outputCost = Math.ceil((usage.completionTokens / 1_000_000) * pricing.outputPrice);
    // SECURITY: 使用 ?? 代替 ||，当 cachedPrice/reasoningPrice 为 0 时正确处理
    const cachedCost = usage.cachedTokens
        ? Math.ceil((usage.cachedTokens / 1_000_000) * (pricing.cachedPrice ?? 0))
        : 0;
    const reasoningCost = usage.reasoningTokens
        ? Math.ceil((usage.reasoningTokens / 1_000_000) * (pricing.reasoningPrice ?? 0))
        : 0;
    const subtotal = inputCost + outputCost + cachedCost + reasoningCost;
    const cost = Math.ceil(subtotal * (pricing.multiplier ?? 1));
    return {
        cost,
        breakdown: {
            inputCost,
            outputCost,
            cachedCost,
            reasoningCost,
        },
    };
}
/**
 * 计算订阅配额使用费用
 *
 * @param tokenCount - Token 数量
 * @param pricePerMillionTokens - 每百万 Token 价格（元）
 * @returns 费用（元），向上取整
 */
export function calculateQuotaCost(tokenCount, pricePerMillionTokens) {
    if (tokenCount < 0) {
        throw new Error('Token 数量不能为负数');
    }
    if (pricePerMillionTokens < 0) {
        throw new Error('价格不能为负数');
    }
    return Math.ceil((tokenCount / 1_000_000) * pricePerMillionTokens);
}
//# sourceMappingURL=calculator.js.map