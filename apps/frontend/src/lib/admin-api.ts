/**
 * Admin API 客户端
 *
 * 封装所有 Admin 后台 API 请求。
 * 自动附加 JWT Token。
 */

import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";
import { buildApiUrl } from "./http";

const API_PREFIX = "/api/v1";

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

export interface MetricCardData {
  totalUsers: number;
  totalUsersGrowth: number;
  totalRecharge: number;
  totalRechargeGrowth: number;
  totalConsumption: number;
  totalConsumptionGrowth: number;
  totalRequests: number;
  totalRequestsGrowth: number;
  totalBalance: number;
}

export interface CallStatsPoint {
  label: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface ModelDistribution {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  orderNo: string;
  userEmail: string;
  amount: number;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
}

export interface ChannelStatus {
  id: string;
  name: string;
  status: string;
  avgLatency: number;
  todayRequests: number;
}

export interface DashboardData {
  metrics: MetricCardData;
  callStats: CallStatsPoint[];
  modelDistribution: ModelDistribution[];
  recentOrders: RecentOrder[];
  channelStatus: ChannelStatus[];
}

// ──────────────────────────────────────────────
// HTTP 请求封装
// ──────────────────────────────────────────────

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  let token = getAccessToken();

  if (!token) {
    throw new Error("未登录");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string>),
  };

  // 仅有 body 时设置 Content-Type，避免 Fastify 报 "Body cannot be empty" 错误
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  // Token 过期，尝试刷新
  if (res.status === 401) {
    try {
      const newTokens = await refreshTokens();
      token = newTokens.accessToken;
      headers["Authorization"] = `Bearer ${token}`;

      res = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
      });
    } catch {
      clearAuthData();
      window.location.href = "/admin/login";
      throw new Error("登录已过期");
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  // 后端返回格式: { code, message, data }
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) {
      throw new Error(json.message || "API Error");
    }
    return json.data as T;
  }

  return json as T;
}

// ──────────────────────────────────────────────
// Dashboard API
// ──────────────────────────────────────────────

/**
 * 获取 Dashboard 数据
 */
export async function getDashboard(startDate?: string, endDate?: string): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const query = params.toString();
  return adminFetch<DashboardData>(`${API_PREFIX}/admin/dashboard${query ? `?${query}` : ""}`);
}

// ──────────────────────────────────────────────
// User API
// ──────────────────────────────────────────────

export interface UserData {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
  search?: string;
}

/**
 * 获取用户列表
 */
export async function getUsers(params: UserListParams = {}): Promise<PaginatedResponse<UserData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.role) searchParams.set("role", params.role);
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<UserData>>(`${API_PREFIX}/admin/users${query ? `?${query}` : ""}`);
}

/**
 * 用户详情数据
 */
export interface UserDetailData extends UserData {
  phone: string | null;
  avatarUrl: string | null;
  githubId: string | null;
  googleId: string | null;
  wechatId: string | null;
  balance: { amount: number; frozen: number; available: number } | null;
  stats: {
    apiKeyCount: number;
    requestCount: number;
    monthlySpend: number;
    monthlyRecharge: number;
    totalSpend: number;
    totalRecharge: number;
    monthlyRequests: number;
    monthlyPromptTokens: number;
    monthlyCompletionTokens: number;
    monthlyTotalTokens: number;
  };
  recentOrders: Array<{
    id: string;
    orderNo: string;
    amount: number;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    paidAt: string | null;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    remark: string | null;
    createdAt: string;
  }>;
  recentApiKeys: Array<{
    id: string;
    name: string | null;
    keyPrefix: string;
    isActive: boolean;
    totalRequests: number;
    lastUsedAt: string | null;
    createdAt: string;
  }>;
}

/**
 * 获取用户详情
 */
export async function getUser(id: string): Promise<UserDetailData> {
  return adminFetch<UserDetailData>(`${API_PREFIX}/admin/users/${id}`);
}

/**
 * 修改用户状态
 */
export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED",
  reason?: string,
): Promise<UserData> {
  return adminFetch<UserData>(`${API_PREFIX}/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}

/**
 * 修改用户角色
 */
export async function updateUserRole(
  userId: string,
  role: string,
): Promise<UserData> {
  return adminFetch<UserData>(`${API_PREFIX}/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/**
 * 角色映射
 */
export function getRoleLabel(role: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: "超级管理员", color: "text-red-600 bg-red-50" },
    ADMIN: { label: "管理员", color: "text-primary bg-primary-50" },
    OPERATOR: { label: "运营", color: "text-purple bg-purple/10" },
    FINANCE: { label: "财务", color: "text-orange bg-orange/10" },
    AUDITOR: { label: "审计", color: "text-info bg-info/10" },
    USER: { label: "普通用户", color: "text-gray-600 bg-gray-100" },
    VIP: { label: "VIP", color: "text-warning bg-warning/10" },
    ENTERPRISE: { label: "企业", color: "text-success bg-success/10" },
    AGENT: { label: "代理", color: "text-gray-600 bg-gray-100" },
  };
  return map[role] ?? { label: role, color: "text-gray-600 bg-gray-100" };
}

/**
 * 用户状态映射
 */
export function getUserStatusLabel(status: string): { label: string; color: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    ACTIVE: { label: "正常", color: "text-success", dotColor: "bg-success" },
    SUSPENDED: { label: "已冻结", color: "text-warning", dotColor: "bg-warning" },
    BANNED: { label: "已封禁", color: "text-red-500", dotColor: "bg-red-500" },
  };
  return map[status] ?? { label: status, color: "text-gray-500", dotColor: "bg-gray-400" };
}

// ──────────────────────────────────────────────
// UserGroup API
// ──────────────────────────────────────────────

export interface UserGroupData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  priceMultiplier: number;
  rpmLimit: number;
  tpmLimit: number;
  maxApiKeys: number;
  allowedModels: string[];
  allowedChannels: string[];
  allowProxy: boolean;
  allowShare: boolean;
  isActive: boolean;
  isBuiltin: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserGroupListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateUserGroupPayload {
  name: string;
  displayName: string;
  description?: string;
  priceMultiplier: number;
  rpmLimit: number;
  tpmLimit: number;
  maxApiKeys: number;
  allowedModels?: string[];
  allowedChannels?: string[];
  allowProxy?: boolean;
  allowShare?: boolean;
}

export interface UpdateUserGroupPayload {
  displayName?: string;
  description?: string;
  priceMultiplier?: number;
  rpmLimit?: number;
  tpmLimit?: number;
  maxApiKeys?: number;
  allowedModels?: string[];
  allowedChannels?: string[];
  allowProxy?: boolean;
  allowShare?: boolean;
}

/**
 * 获取用户组列表
 */
export async function getUserGroups(params: UserGroupListParams = {}): Promise<PaginatedResponse<UserGroupData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.isActive !== undefined) searchParams.set("isActive", String(params.isActive));

  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<UserGroupData>>(`${API_PREFIX}/admin/user-groups${query ? `?${query}` : ""}`);
}

/**
 * 获取用户组详情
 */
export async function getUserGroup(id: string): Promise<UserGroupData> {
  return adminFetch<UserGroupData>(`${API_PREFIX}/admin/user-groups/${id}`);
}

/**
 * 创建用户组
 */
export async function createUserGroup(payload: CreateUserGroupPayload): Promise<UserGroupData> {
  return adminFetch<UserGroupData>(`${API_PREFIX}/admin/user-groups`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 更新用户组
 */
export async function updateUserGroup(id: string, payload: UpdateUserGroupPayload): Promise<UserGroupData> {
  return adminFetch<UserGroupData>(`${API_PREFIX}/admin/user-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * 切换用户组状态
 */
export async function toggleUserGroup(id: string): Promise<UserGroupData> {
  return adminFetch<UserGroupData>(`${API_PREFIX}/admin/user-groups/${id}/toggle`, {
    method: "PATCH",
  });
}

/**
 * 删除用户组
 */
export async function deleteUserGroup(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/user-groups/${id}`, {
    method: "DELETE",
  });
}

// ──────────────────────────────────────────────
// Role API
// ──────────────────────────────────────────────

export interface RoleData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  dataScope: string;
  permissionCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetailData extends RoleData {
  permissions: PermissionData[];
}

export interface PermissionData {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
}

/**
 * 获取角色列表
 */
export async function getRoles(): Promise<RoleData[]> {
  return adminFetch<RoleData[]>(`${API_PREFIX}/admin/roles`);
}

/**
 * 获取角色详情
 */
export async function getRole(id: string): Promise<RoleDetailData> {
  return adminFetch<RoleDetailData>(`${API_PREFIX}/admin/roles/${id}`);
}

/**
 * 获取所有权限点
 */
export async function getPermissions(): Promise<PermissionData[]> {
  return adminFetch<PermissionData[]>(`${API_PREFIX}/admin/permissions`);
}

// ──────────────────────────────────────────────
// API Key Admin API
// ──────────────────────────────────────────────

export interface ApiKeyAdminData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  keyPrefix: string;
  name: string | null;
  isActive: boolean;
  expiresAt: string | null;
  rateLimit: number | null;
  tokenLimit: number | null;
  modelLimit: string[];
  ipWhitelist: string[];
  lastUsedAt: string | null;
  totalRequests: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  userId?: string;
}

/**
 * 获取 API Key 列表（Admin）
 */
export async function getApiKeys(params: ApiKeyListParams = {}): Promise<PaginatedResponse<ApiKeyAdminData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.isActive !== undefined) searchParams.set("isActive", String(params.isActive));
  if (params.userId) searchParams.set("userId", params.userId);

  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<ApiKeyAdminData>>(`${API_PREFIX}/admin/api-keys${query ? `?${query}` : ""}`);
}

/**
 * 切换 API Key 状态
 */
export async function toggleApiKey(id: string): Promise<ApiKeyAdminData> {
  return adminFetch<ApiKeyAdminData>(`${API_PREFIX}/admin/api-keys/${id}/toggle`, {
    method: "PATCH",
  });
}

/**
 * 删除 API Key
 */
export async function deleteApiKey(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/api-keys/${id}`, {
    method: "DELETE",
  });
}

// ──────────────────────────────────────────────
// Order Admin API
// ──────────────────────────────────────────────

export interface OrderAdminData {
  id: string;
  orderNo: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  amount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  status: string;
  productType: string;
  productName: string;
  paidAt: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  userId?: string;
}

/**
 * 获取订单列表（Admin）
 */
export async function getOrders(params: OrderListParams = {}): Promise<PaginatedResponse<OrderAdminData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.userId) searchParams.set("userId", params.userId);

  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<OrderAdminData>>(`${API_PREFIX}/admin/orders${query ? `?${query}` : ""}`);
}

/**
 * 获取订单详情
 */
export async function getOrder(id: string): Promise<OrderAdminData> {
  return adminFetch<OrderAdminData>(`${API_PREFIX}/admin/orders/${id}`);
}

/**
 * 订单状态映射
 */
export function getOrderStatusLabel(status: string): { label: string; color: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    PENDING: { label: "待支付", color: "text-warning", dotColor: "bg-warning" },
    PAID: { label: "已支付", color: "text-success", dotColor: "bg-success" },
    FAILED: { label: "支付失败", color: "text-red-500", dotColor: "bg-red-500" },
    REFUNDED: { label: "已退款", color: "text-gray-500", dotColor: "bg-gray-500" },
    CANCELLED: { label: "已取消", color: "text-gray-400", dotColor: "bg-gray-400" },
  };
  return map[status] ?? { label: status, color: "text-gray-500", dotColor: "bg-gray-400" };
}

/**
 * 支付方式映射
 */
export function getPaymentMethodLabel(method: string | null): string {
  if (!method) return "-";
  const map: Record<string, string> = {
    WECHAT_PAY: "微信支付",
    ALIPAY: "支付宝",
    EPAY_ALIPAY: "易支付-支付宝",
    EPAY_WECHAT: "易支付-微信",
    EPAY_QQ: "易支付-QQ",
    BALANCE: "余额支付",
  };
  return map[method] ?? method;
}

/**
 * 渠道状态映射
 */
export function getChannelStatusLabel(status: string): { label: string; color: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    ACTIVE: { label: "正常", color: "text-success", dotColor: "bg-success" },
    RATE_LIMITED: { label: "限流", color: "text-warning", dotColor: "bg-warning" },
    ERROR: { label: "异常", color: "text-red-500", dotColor: "bg-red-500" },
    DISABLED: { label: "已禁用", color: "text-gray-400", dotColor: "bg-gray-400" },
  };
  return map[status] ?? { label: status, color: "text-gray-500", dotColor: "bg-gray-400" };
}

// ──────────────────────────────────────────────
// Bill (交易流水) Admin API
// ──────────────────────────────────────────────

export interface BillAdminData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  type: string;
  amount: number;
  balanceAfter: number;
  remark: string | null;
  createdAt: string;
}

export interface BillListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  userId?: string;
}

export async function getBills(params: BillListParams = {}): Promise<PaginatedResponse<BillAdminData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.type) searchParams.set("type", params.type);
  if (params.userId) searchParams.set("userId", params.userId);
  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<BillAdminData>>(`${API_PREFIX}/admin/bills${query ? `?${query}` : ""}`);
}

/**
 * 交易类型映射
 */
export function getTransactionTypeLabel(type: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    RECHARGE: { label: "充值", color: "text-success bg-success/10" },
    DEDUCT: { label: "消费", color: "text-red-600 bg-red-50" },
    GIFT: { label: "赠送", color: "text-orange bg-orange/10" },
    REFUND: { label: "退款", color: "text-info bg-info/10" },
    REWARD: { label: "奖励", color: "text-purple bg-purple/10" },
  };
  return map[type] ?? { label: type, color: "text-gray-600 bg-gray-100" };
}

// ──────────────────────────────────────────────
// Provider API
// ──────────────────────────────────────────────

export interface ProviderData {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
  channelCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderPayload {
  name: string;
  displayName: string;
  baseUrl: string;
  isActive?: boolean;
}

export interface UpdateProviderPayload {
  displayName?: string;
  baseUrl?: string;
  isActive?: boolean;
}

export interface ProviderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getProviders(params: ProviderListParams = {}): Promise<PaginatedResponse<ProviderData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<ProviderData>>(`${API_PREFIX}/admin/providers${query ? `?${query}` : ""}`);
}

export async function createProvider(payload: CreateProviderPayload): Promise<ProviderData> {
  return adminFetch<ProviderData>(`${API_PREFIX}/admin/providers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProvider(id: string, payload: UpdateProviderPayload): Promise<ProviderData> {
  return adminFetch<ProviderData>(`${API_PREFIX}/admin/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProvider(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/providers/${id}`, {
    method: "DELETE",
  });
}

// ──────────────────────────────────────────────
// Channel API
// ──────────────────────────────────────────────

export interface ChannelProvider {
  id: string;
  name: string;
  displayName: string;
}

export interface ChannelData {
  id: string;
  providerId: string;
  provider: ChannelProvider | null;
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
  modelCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelPayload {
  providerId: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  weight?: number;
  priority?: number;
}

export interface UpdateChannelPayload {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
  weight?: number;
  priority?: number;
}

export interface ChannelListParams {
  page?: number;
  pageSize?: number;
  providerId?: string;
  search?: string;
  status?: string;
}

export interface ChannelTestResult {
  success: boolean;
  latencyMs: number;
  message: string;
}

export async function getChannels(params: ChannelListParams = {}): Promise<PaginatedResponse<ChannelData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.providerId) searchParams.set("providerId", params.providerId);
  if (params.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<ChannelData>>(`${API_PREFIX}/admin/channels${query ? `?${query}` : ""}`);
}

export async function createChannel(payload: CreateChannelPayload): Promise<ChannelData> {
  return adminFetch<ChannelData>(`${API_PREFIX}/admin/channels`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateChannel(id: string, payload: UpdateChannelPayload): Promise<ChannelData> {
  return adminFetch<ChannelData>(`${API_PREFIX}/admin/channels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function enableChannel(id: string): Promise<ChannelData> {
  return adminFetch<ChannelData>(`${API_PREFIX}/admin/channels/${id}/enable`, {
    method: "PATCH",
  });
}

export async function disableChannel(id: string): Promise<ChannelData> {
  return adminFetch<ChannelData>(`${API_PREFIX}/admin/channels/${id}/disable`, {
    method: "PATCH",
  });
}

export async function deleteChannel(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/channels/${id}`, {
    method: "DELETE",
  });
}

export async function testChannel(id: string): Promise<ChannelTestResult> {
  return adminFetch<ChannelTestResult>(`${API_PREFIX}/admin/channels/${id}/test`, {
    method: "POST",
  });
}

// ──────────────────────────────────────────────
// Model API
// ──────────────────────────────────────────────

export interface ModelPricing {
  id: string;
  inputPrice: number;
  outputPrice: number;
  cachedPrice: number | null;
  reasoningPrice: number | null;
  multiplier: number;
}

export interface ModelData {
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

export interface CreateModelPayload {
  name: string;
  displayName: string;
  providerId: string;
  maxContext: number;
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
}

export interface UpdateModelPayload {
  displayName?: string;
  maxContext?: number;
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
  isActive?: boolean;
}

export interface UpsertPricingPayload {
  inputPrice: number;
  outputPrice: number;
  cachedPrice?: number;
  reasoningPrice?: number;
  multiplier?: number;
}

export interface ModelListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getModels(params: ModelListParams = {}): Promise<PaginatedResponse<ModelData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<ModelData>>(`${API_PREFIX}/admin/models${query ? `?${query}` : ""}`);
}

export async function createModel(payload: CreateModelPayload): Promise<ModelData> {
  return adminFetch<ModelData>(`${API_PREFIX}/admin/models`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateModel(id: string, payload: UpdateModelPayload): Promise<ModelData> {
  return adminFetch<ModelData>(`${API_PREFIX}/admin/models/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteModel(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/models/${id}`, {
    method: "DELETE",
  });
}

export async function upsertModelPricing(id: string, payload: UpsertPricingPayload): Promise<ModelData> {
  return adminFetch<ModelData>(`${API_PREFIX}/admin/models/${id}/pricing`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 模型状态映射
 */
export function getModelStatusLabel(isActive: boolean): { label: string; color: string; dotColor: string } {
  return isActive
    ? { label: "上架中", color: "text-success", dotColor: "bg-success" }
    : { label: "已下架", color: "text-gray-400", dotColor: "bg-gray-400" };
}

/**
 * Provider 状态映射
 */
export function getProviderStatusLabel(isActive: boolean): { label: string; color: string; dotColor: string } {
  return isActive
    ? { label: "启用", color: "text-success", dotColor: "bg-success" }
    : { label: "禁用", color: "text-gray-400", dotColor: "bg-gray-400" };
}

// ──────────────────────────────────────────────
// RechargePromotion API
// ──────────────────────────────────────────────

export interface PromotionData {
  id: string;
  name: string;
  description: string | null;
  minAmount: number;
  bonusType: "FIXED" | "PERCENTAGE";
  bonusValue: number;
  maxBonus: number | null;
  startAt: string;
  endAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionPayload {
  name: string;
  description?: string;
  min_amount: number;
  bonus_type: "FIXED" | "PERCENTAGE";
  bonus_value: number;
  max_bonus?: number;
  start_at: string;
  end_at?: string;
  is_active?: boolean;
}

export interface UpdatePromotionPayload {
  name?: string;
  description?: string;
  min_amount?: number;
  bonus_type?: "FIXED" | "PERCENTAGE";
  bonus_value?: number;
  max_bonus?: number;
  start_at?: string;
  end_at?: string;
  is_active?: boolean;
}

export async function getPromotions(params: { page?: number; pageSize?: number; isActive?: boolean } = {}): Promise<PaginatedResponse<PromotionData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.isActive !== undefined) searchParams.set("isActive", String(params.isActive));
  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<PromotionData>>(`${API_PREFIX}/admin/promotions${query ? `?${query}` : ""}`);
}

export async function createPromotion(payload: CreatePromotionPayload): Promise<PromotionData> {
  return adminFetch<PromotionData>(`${API_PREFIX}/admin/promotions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePromotion(id: string, payload: UpdatePromotionPayload): Promise<PromotionData> {
  return adminFetch<PromotionData>(`${API_PREFIX}/admin/promotions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function togglePromotion(id: string): Promise<PromotionData> {
  return adminFetch<PromotionData>(`${API_PREFIX}/admin/promotions/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function deletePromotion(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/promotions/${id}`, {
    method: "DELETE",
  });
}

/**
 * 赠送类型映射
 */
export function getBonusTypeLabel(type: string): string {
  return type === "FIXED" ? "固定金额" : "百分比";
}

// ──────────────────────────────────────────────
// Invoice API
// ──────────────────────────────────────────────

export interface InvoiceData {
  id: string;
  invoiceNo: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  type: string;
  companyName: string | null;
  taxId: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  bankName: string | null;
  bankAccount: string | null;
  amount: number;
  content: string;
  status: string;
  applicantEmail: string;
  applicantPhone: string | null;
  mailingAddress: string | null;
  fileUrl: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewRemark: string | null;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export interface CreateInvoicePayload {
  type: "COMPANY" | "PERSONAL";
  company_name?: string;
  tax_id?: string;
  company_address?: string;
  company_phone?: string;
  bank_name?: string;
  bank_account?: string;
  amount: number;
  content?: string;
  applicant_email: string;
  applicant_phone?: string;
  mailing_address?: string;
}

export interface ReviewInvoicePayload {
  status: "APPROVED" | "REJECTED";
  review_remark?: string;
}

export interface IssueInvoicePayload {
  file_url?: string;
}

export async function getInvoices(params: InvoiceListParams = {}): Promise<PaginatedResponse<InvoiceData>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  return adminFetch<PaginatedResponse<InvoiceData>>(`${API_PREFIX}/admin/invoices${query ? `?${query}` : ""}`);
}

export async function getInvoice(id: string): Promise<InvoiceData> {
  return adminFetch<InvoiceData>(`${API_PREFIX}/admin/invoices/${id}`);
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<InvoiceData> {
  return adminFetch<InvoiceData>(`${API_PREFIX}/admin/invoices`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function reviewInvoice(id: string, payload: ReviewInvoicePayload): Promise<InvoiceData> {
  return adminFetch<InvoiceData>(`${API_PREFIX}/admin/invoices/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function issueInvoice(id: string, payload: IssueInvoicePayload = {}): Promise<InvoiceData> {
  return adminFetch<InvoiceData>(`${API_PREFIX}/admin/invoices/${id}/issue`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/invoices/${id}`, {
    method: "DELETE",
  });
}

/**
 * 发票状态映射
 */
export function getInvoiceStatusLabel(status: string): { label: string; color: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    PENDING: { label: "待审核", color: "text-warning", dotColor: "bg-warning" },
    APPROVED: { label: "已通过", color: "text-success", dotColor: "bg-success" },
    REJECTED: { label: "已驳回", color: "text-red-500", dotColor: "bg-red-500" },
    ISSUED: { label: "已开具", color: "text-primary", dotColor: "bg-primary" },
    CANCELLED: { label: "已取消", color: "text-gray-400", dotColor: "bg-gray-400" },
  };
  return map[status] ?? { label: status, color: "text-gray-500", dotColor: "bg-gray-400" };
}

/**
 * 发票类型映射
 */
export function getInvoiceTypeLabel(type: string): string {
  return type === "COMPANY" ? "企业发票" : "个人发票";
}

// ──────────────────────────────────────────────
// System Settings API
// ──────────────────────────────────────────────

export interface SystemSettingData {
  category: string;
  key: string;
  value: string | null;
  type: string;
}

/**
 * 获取所有系统设置（按分类分组）
 */
export async function getSystemSettings(): Promise<Record<string, SystemSettingData[]>> {
  return adminFetch<Record<string, SystemSettingData[]>>(`${API_PREFIX}/admin/system-settings`);
}

/**
 * 获取指定分类的系统设置
 */
export async function getSystemSettingsByCategory(category: string): Promise<SystemSettingData[]> {
  return adminFetch<SystemSettingData[]>(`${API_PREFIX}/admin/system-settings/${category}`);
}

/**
 * 批量更新分类设置
 */
export async function updateSystemSettings(category: string, settings: Array<{ key: string; value: string | null }>): Promise<void> {
  return adminFetch<void>(`${API_PREFIX}/admin/system-settings/${category}`, {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
}

/**
 * 更新单个设置
 */
export async function updateSystemSetting(category: string, key: string, value: string | null): Promise<SystemSettingData> {
  return adminFetch<SystemSettingData>(`${API_PREFIX}/admin/system-settings/${category}/${key}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

// ──────────────────────────────────────────────
// SMTP 配置 API
// ──────────────────────────────────────────────

export interface SmtpConfigData {
  id: string;
  name: string;
  is_enabled: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  username: string | null;
  password: string | null;
  from_name: string | null;
  from_address: string | null;
  extra_config: unknown;
  created_at: string;
  updated_at: string;
}

export interface UpdateSmtpConfigPayload {
  is_enabled?: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  from_name?: string;
  from_address?: string;
}

export interface SmtpTestResult {
  success: boolean;
  message: string;
}

/**
 * 获取 SMTP 配置
 */
export async function getSmtpConfig(): Promise<SmtpConfigData | null> {
  return adminFetch<SmtpConfigData | null>(`${API_PREFIX}/admin/smtp-config`);
}

/**
 * 更新 SMTP 配置
 */
export async function updateSmtpConfig(payload: UpdateSmtpConfigPayload): Promise<SmtpConfigData> {
  return adminFetch<SmtpConfigData>(`${API_PREFIX}/admin/smtp-config`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 切换 SMTP 启用状态
 */
export async function toggleSmtpConfig(): Promise<SmtpConfigData> {
  return adminFetch<SmtpConfigData>(`${API_PREFIX}/admin/smtp-config/toggle`, {
    method: "PATCH",
  });
}

/**
 * 测试 SMTP 连接
 */
export async function testSmtpConnection(): Promise<SmtpTestResult> {
  return adminFetch<SmtpTestResult>(`${API_PREFIX}/admin/smtp-config/test-connection`, {
    method: "POST",
  });
}

/**
 * 发送测试邮件
 */
export async function sendTestEmail(email: string): Promise<SmtpTestResult> {
  return adminFetch<SmtpTestResult>(`${API_PREFIX}/admin/smtp-config/send-test`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

/**
 * 格式化金额（元）
 */
export function formatAmount(yuan: number): string {
  return yuan.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 格式化大数字
 */
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString("zh-CN");
}

/**
 * 格式化日期
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
