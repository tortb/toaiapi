import type { TokenUsage } from './types';

const TOLERANCE = 0.1; // 10% tolerance

/**
 * Validate token usage against provider reported values
 * Returns calculated values if mismatch exceeds tolerance
 */
export function validateTokenUsage(
  providerUsage: TokenUsage,
  calculatedUsage: TokenUsage,
): { usage: TokenUsage; mismatch: boolean } {
  const promptDiff = calculatedUsage.promptTokens > 0
    ? Math.abs(providerUsage.promptTokens - calculatedUsage.promptTokens) / calculatedUsage.promptTokens
    : 0;

  const completionDiff = calculatedUsage.completionTokens > 0
    ? Math.abs(providerUsage.completionTokens - calculatedUsage.completionTokens) / calculatedUsage.completionTokens
    : 0;

  const mismatch = promptDiff > TOLERANCE || completionDiff > TOLERANCE;

  // Always use calculated values for billing
  return {
    usage: calculatedUsage,
    mismatch,
  };
}

/**
 * Check if balance is sufficient for cost
 */
export function checkBalance(available: number, required: number): boolean {
  return available >= required;
}
