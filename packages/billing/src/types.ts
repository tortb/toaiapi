export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

export interface ModelPricing {
  inputPrice: number;      // 元/百万token
  outputPrice: number;     // 元/百万token
  cachedPrice?: number;    // 元/百万token
  reasoningPrice?: number; // 元/百万token
  multiplier: number;
}

export interface BillingResult {
  cost: number;            // 元
  breakdown: {
    inputCost: number;
    outputCost: number;
    cachedCost: number;
    reasoningCost: number;
  };
}
