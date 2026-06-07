export interface DashboardStats {
  balance: number;
  monthlySpend: number;
  monthlyRequests: number;
  monthlyTokens: number;
  apiKeyCount: number;
  activeApiKeyCount: number;
}

export interface RequestLog {
  id: string;
  createdAt: string;
  method?: string;
  endpoint: string;
  modelId?: string | null;
  channelId?: string | null;
  statusCode: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  errorMessage?: string | null;
  requestBody?: unknown;
  responseBody?: unknown;
}
