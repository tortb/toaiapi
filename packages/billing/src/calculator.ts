import type { TokenUsage, ModelPricing, BillingResult } from './types';

/**
 * Calculate billing cost for token usage
 * All costs are in cents (分), rounded up
 */
export function calculateCost(usage: TokenUsage, pricing: ModelPricing): BillingResult {
  const inputCost = Math.ceil(
    (usage.promptTokens / 1_000_000) * pricing.inputPrice
  );

  const outputCost = Math.ceil(
    (usage.completionTokens / 1_000_000) * pricing.outputPrice
  );

  const cachedCost = usage.cachedTokens
    ? Math.ceil((usage.cachedTokens / 1_000_000) * (pricing.cachedPrice || 0))
    : 0;

  const reasoningCost = usage.reasoningTokens
    ? Math.ceil((usage.reasoningTokens / 1_000_000) * (pricing.reasoningPrice || 0))
    : 0;

  const subtotal = inputCost + outputCost + cachedCost + reasoningCost;
  const cost = Math.ceil(subtotal * pricing.multiplier);

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
 * Calculate cost for subscription quota usage
 */
export function calculateQuotaCost(
  tokenCount: number,
  pricePerMillionTokens: number,
): number {
  return Math.ceil((tokenCount / 1_000_000) * pricePerMillionTokens);
}
