import type { TokenUsage, ModelPricing, BillingResult } from './types';
/**
 * Calculate billing cost for token usage
 * All costs are in cents (分), rounded up
 */
export declare function calculateCost(usage: TokenUsage, pricing: ModelPricing): BillingResult;
/**
 * Calculate cost for subscription quota usage
 */
export declare function calculateQuotaCost(tokenCount: number, pricePerMillionTokens: number): number;
//# sourceMappingURL=calculator.d.ts.map