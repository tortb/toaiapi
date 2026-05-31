export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    cachedTokens: number;
    reasoningTokens: number;
}
export interface ModelPricing {
    inputPrice: number;
    outputPrice: number;
    cachedPrice?: number;
    reasoningPrice?: number;
    multiplier: number;
}
export interface BillingResult {
    cost: number;
    breakdown: {
        inputCost: number;
        outputCost: number;
        cachedCost: number;
        reasoningCost: number;
    };
}
//# sourceMappingURL=types.d.ts.map