// ──────────────────────────────────────────────
// 通用类型
// ──────────────────────────────────────────────

/** API 统一响应格式 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 分页数据 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Token 响应 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/** 认证响应 */
export interface AuthResponse {
  user: AdminUser;
  tokens: TokenResponse;
}

// ──────────────────────────────────────────────
// 用户相关
// ──────────────────────────────────────────────

/** Admin 用户信息 */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  status?: string;
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export interface Provider {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
  channelCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderInput {
  name: string;
  displayName: string;
  baseUrl: string;
  isActive?: boolean;
}

export interface UpdateProviderInput {
  displayName?: string;
  baseUrl?: string;
  isActive?: boolean;
}

// ──────────────────────────────────────────────
// Channel
// ──────────────────────────────────────────────

export interface Channel {
  id: string;
  providerId: string;
  provider?: {
    id: string;
    name: string;
    displayName: string;
  };
  name: string;
  baseUrl: string;
  keyPrefix: string;
  weight: number;
  priority: number;
  isActive: boolean;
  status: string;
  totalRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  modelCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelInput {
  providerId: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  weight?: number;
  priority?: number;
}

export interface UpdateChannelInput {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
  weight?: number;
  priority?: number;
}

// ──────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────

export interface ModelPricing {
  id: string;
  inputPrice: number;
  outputPrice: number;
  cachedPrice: number | null;
  reasoningPrice: number | null;
  multiplier: number;
}

export interface Model {
  id: string;
  name: string;
  displayName: string;
  providerId: string;
  maxContext: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  isActive: boolean;
  pricing: ModelPricing | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModelInput {
  name: string;
  displayName: string;
  providerId: string;
  maxContext: number;
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
}

export interface UpdateModelInput {
  displayName?: string;
  maxContext?: number;
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
  isActive?: boolean;
}

export interface UpsertPricingInput {
  inputPrice: number;
  outputPrice: number;
  cachedPrice?: number;
  reasoningPrice?: number;
  multiplier?: number;
}

// ──────────────────────────────────────────────
// User（管理视角）
// ──────────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  balance: {
    amount: number;
    frozen: number;
    available: number;
  } | null;
  stats: {
    apiKeyCount: number;
    requestCount: number;
  };
}

export interface UpdateUserRoleInput {
  role: string;
}

export interface UpdateUserStatusInput {
  status: string;
  reason?: string;
}

// ──────────────────────────────────────────────
// Dashboard 统计
// ──────────────────────────────────────────────

export interface DashboardStats {
  userCount: number;
  providerCount: number;
  channelCount: number;
  modelCount: number;
  todayRequests: number;
  todayTokens: number;
}
