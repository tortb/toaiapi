export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

export interface ModelPricing {
  inputPrice: number;      // cents per million tokens
  outputPrice: number;     // cents per million tokens
  cachedPrice?: number;    // cents per million tokens
  reasoningPrice?: number; // cents per million tokens
  multiplier: number;
}

export interface BillingResult {
  cost: number;            // in cents
  breakdown: {
    inputCost: number;
    outputCost: number;
    cachedCost: number;
    reasoningCost: number;
  };
}
