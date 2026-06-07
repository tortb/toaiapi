export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

export interface ModelPricing {
  inputPrice: number;      // 分/百万token
  outputPrice: number;     // 分/百万token
  cachedPrice?: number;    // 分/百万token
  reasoningPrice?: number; // 分/百万token
  multiplier: number;
}

export interface BillingResult {
  cost: number;            // 分
  breakdown: {
    inputCost: number;
    outputCost: number;
    cachedCost: number;
    reasoningCost: number;
  };
}
