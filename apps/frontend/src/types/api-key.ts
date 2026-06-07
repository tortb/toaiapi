export interface ApiKey {
  id: string;
  name: string | null;
  keyPrefix: string;
  isActive: boolean;
  expiresAt: string | null;
  rateLimit: number | null;
  tokenLimit: number | null;
  modelLimit: string[];
  ipWhitelist: string[];
  lastUsedAt: string | null;
  totalRequests: number;
  createdAt: string;
}

export interface CreateApiKeyPayload {
  name?: string;
}

export interface UpdateApiKeyPayload {
  name?: string;
  expiresAt?: string | null;
  rateLimit?: number | null;
  tokenLimit?: number | null;
  modelLimit?: string[];
  ipWhitelist?: string[];
}

export interface CreateApiKeyResult {
  id: string;
  name: string | null;
  key: string;
  keyPrefix: string;
  isActive: boolean;
  createdAt: string;
}
