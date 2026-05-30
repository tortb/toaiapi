import type { TokenUsage } from './types';
/**
 * Validate token usage against provider reported values
 * Returns calculated values if mismatch exceeds tolerance
 */
export declare function validateTokenUsage(providerUsage: TokenUsage, calculatedUsage: TokenUsage): {
    usage: TokenUsage;
    mismatch: boolean;
};
/**
 * Check if balance is sufficient for cost
 */
export declare function checkBalance(available: number, required: number): boolean;
//# sourceMappingURL=validator.d.ts.map