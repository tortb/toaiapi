/**
 * API 响应格式
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页数据
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 用户信息
 */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
}

/**
 * API Key
 */
export interface ApiKey {
  id: string;
  name: string | null;
  keyPrefix: string;
  key?: string;
  isActive: boolean;
  expiresAt: string | null;
  rateLimit: number | null;
  tokenLimit: number | null;
  modelLimit: string[];
  ipWhitelist: string[];
  createdAt: string;
}

/**
 * 余额信息
 */
export interface Balance {
  amount: number;
  frozen: number;
  available: number;
}

/**
 * 交易记录
 */
export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  orderId: string | null;
  remark: string | null;
  createdAt: string;
}

/**
 * 请求日志
 */
export interface RequestLog {
  id: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  statusCode: number;
  latencyMs: number;
  createdAt: string;
}

/**
 * Token 响应
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * 登录响应
 */
export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}

/**
 * 模型信息（OpenAI 格式）
 */
export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * 公开模型信息（含定价和能力）
 */
export interface PublicModel {
  id: string;
  displayName: string;
  providerId: string;
  maxContext: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  pricing: {
    inputPrice: number;
    outputPrice: number;
    cachedPrice: number | null;
    reasoningPrice: number | null;
    multiplier: number;
  } | null;
}

/**
 * 渠道状态
 */
export interface ChannelStatus {
  provider: string;
  channel: string;
  status: string;
  avgLatencyMs: number;
  totalRequests: number;
  failedRequests: number;
  failureRate: number;
}

/**
 * 支付方式
 */
export interface PaymentMethod {
  name: string;
  displayName: string;
}

/**
 * 充值订单
 */
export interface RechargeOrder {
  orderNo: string;
  amount: number;
  paymentMethod: string;
  status: string;
  payUrl: string;
  createdAt: string;
}

/**
 * 订单详情（后端返回 snake_case）
 */
export interface OrderDetail {
  id: string;
  order_no: string;
  amount: number;
  paid_amount: number | null;
  payment_method: string;
  status: string;
  product_type: string;
  product_name: string;
  paid_at: string | null;
  created_at: string;
}
