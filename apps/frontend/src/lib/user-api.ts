/**
 * 用户端 API 客户端
 *
 * 封装用户个人信息、API Key 管理等请求。
 * 自动附加 JWT Token。
 */

import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";
import { buildApiUrl } from "./http";

const API_PREFIX = "/api/v1";

// ──────────────────────────────────────────────
// HTTP 请求封装
// ──────────────────────────────────────────────

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  let token = getAccessToken();
  if (!token) throw new Error("未登录");

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...init, headers, credentials: "include" });

  if (res.status === 401) {
    try {
      const newTokens = await refreshTokens();
      token = newTokens.accessToken;
      headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, { ...init, headers, credentials: "include" });
    } catch {
      clearAuthData();
      window.location.href = "/login";
      throw new Error("登录已过期");
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) throw new Error(json.message || "API Error");
    return json.data as T;
  }
  return json as T;
}

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

export interface UserApiKey {
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
  // 增强字段（后端需配合返回）
  usageToday?: number;   // 今日消费(分)
  usage30d?: number;     // 近30天消费(分)
  group?: { id: string; name: string } | null; // 所属分组
  rpmLimit?: number;     // RPM 限制
  tpmLimit?: number;     // TPM 限制
}

export interface CreateApiKeyResult {
  id: string;
  name: string | null;
  key: string; // 仅在创建时返回完整 key
  keyPrefix: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// 用户信息 API
// ──────────────────────────────────────────────

/** 获取当前用户信息 */
export async function getUserProfile(): Promise<UserProfile> {
  return authFetch<UserProfile>(`${API_PREFIX}/users/me`);
}

/** 更新用户信息 */
export async function updateUserProfile(data: {
  displayName?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  return authFetch<UserProfile>(`${API_PREFIX}/users/me`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** 修改密码 */
export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/auth/change-password`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────────
// API Key 管理
// ──────────────────────────────────────────────

/** 获取用户的 API Key 列表 */
export async function getUserApiKeys(): Promise<UserApiKey[]> {
  return authFetch<UserApiKey[]>(`${API_PREFIX}/api-keys`);
}

/** 创建 API Key */
export async function createApiKey(params: {
  name?: string;
  count?: number;
  unlimitedQuota?: boolean;
  rpmLimit?: number;
  tpmLimit?: number;
  expiresAt?: string;
  groupId?: string;
  ipWhitelist?: string;
  modelLimit?: string;
}): Promise<CreateApiKeyResult> {
  return authFetch<CreateApiKeyResult>(`${API_PREFIX}/api-keys`, {
    method: "POST",
    body: JSON.stringify({
      name: params.name || undefined,
      count: params.count,
      unlimited_quota: params.unlimitedQuota,
      rpm_limit: params.rpmLimit,
      tpm_limit: params.tpmLimit,
      expires_at: params.expiresAt || undefined,
      group_id: params.groupId || undefined,
      ip_whitelist: params.ipWhitelist || undefined,
      model_limit: params.modelLimit || undefined,
    }),
  });
}

/** 更新 API Key 配置 */
export async function updateApiKey(
  id: string,
  data: {
    name?: string;
    expiresAt?: string | null;
    rateLimit?: number | null;
    tokenLimit?: number | null;
    modelLimit?: string[];
    ipWhitelist?: string[];
  },
): Promise<UserApiKey> {
  return authFetch<UserApiKey>(`${API_PREFIX}/api-keys/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** 启用 API Key */
export async function enableApiKey(id: string): Promise<UserApiKey> {
  return authFetch<UserApiKey>(`${API_PREFIX}/api-keys/${id}/enable`, {
    method: "PATCH",
  });
}

/** 禁用 API Key */
export async function disableApiKey(id: string): Promise<UserApiKey> {
  return authFetch<UserApiKey>(`${API_PREFIX}/api-keys/${id}/disable`, {
    method: "PATCH",
  });
}

/** 删除 API Key */
export async function deleteApiKey(id: string): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/api-keys/${id}`, {
    method: "DELETE",
  });
}

/** 轮换 API Key */
export async function rotateApiKey(id: string): Promise<CreateApiKeyResult> {
  return authFetch<CreateApiKeyResult>(`${API_PREFIX}/api-keys/${id}/rotate`, {
    method: "POST",
  });
}

// ──────────────────────────────────────────────
// 数据分析 API
// ──────────────────────────────────────────────

export interface AnalyticsSummary {
  totalUsers: number;
  totalQuota: number;
  totalTokens: number;
  avgRpm: number;
  avgTpm: number;
}

export interface CostDistributionItem {
  model: string;
  cost: number;
  percentage: number;
}

export interface ModelCallItem {
  model: string;
  calls: number;
  tokens: number;
}

export interface CallTrendItem {
  date: string;
  calls: number;
  tokens: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  costDistribution: CostDistributionItem[];
  modelCallAnalysis: ModelCallItem[];
  callTrend: CallTrendItem[];
}

/** 获取模型调用分析数据 */
export async function getAnalytics(period: string = "7d"): Promise<AnalyticsResponse> {
  return authFetch<AnalyticsResponse>(`${API_PREFIX}/balance/analytics?period=${period}`);
}

/** 获取调用趋势 */
export async function getCallTrend(period: string = "7d"): Promise<CallTrendItem[]> {
  return authFetch<CallTrendItem[]>(`${API_PREFIX}/balance/analytics/call-trend?period=${period}`);
}

/** 获取模型调用排行 */
export async function getModelRanking(period: string = "7d"): Promise<ModelCallItem[]> {
  return authFetch<ModelCallItem[]>(`${API_PREFIX}/balance/analytics/model-ranking?period=${period}`);
}

// ──────────────────────────────────────────────
// 排行榜 API
// ──────────────────────────────────────────────

export interface LeaderboardModel {
  rank: number;
  model: string;
  vendor: string;
  requests: number;
  tokens: number;
  change: number; // 排名变化，正数上升，负数下降
}

export interface VendorMarketShare {
  vendor: string;
  tokens: number;
  percentage: number;
}

export interface TrendingModel {
  model: string;
  vendor: string;
  change: number; // 百分比变化
  currentRank: number;
}

export interface LeaderboardResponse {
  hotModels: LeaderboardModel[];
  leaderboard: LeaderboardModel[];
  marketShare: VendorMarketShare[];
  rising: TrendingModel[];
  falling: TrendingModel[];
}

/** 获取排行榜数据 */
export async function getLeaderboard(period: string = "week"): Promise<LeaderboardResponse> {
  return authFetch<LeaderboardResponse>(`${API_PREFIX}/leaderboard?period=${period}`);
}

// ──────────────────────────────────────────────
// 通知配置 API
// ──────────────────────────────────────────────

export interface NotificationChannel {
  enabled: boolean;
  url?: string;
  secret?: string;
  appToken?: string;
  uid?: string;
  webhookUrl?: string;
}

export interface NotificationConfig {
  email: string | null;
  subscriptions: {
    lowBalance: boolean;
    promotions: boolean;
    periodic: boolean;
    announcements: boolean;
    priceChanges: boolean;
  };
  lowBalanceThreshold: number; // 单位: 分
  channels: {
    email: NotificationChannel;
    webhook: NotificationChannel;
    wxpusher: NotificationChannel;
    wechatWork: NotificationChannel;
    dingtalk: NotificationChannel;
    feishu: NotificationChannel;
  };
}

/** 获取通知配置 */
export async function getNotificationConfig(): Promise<NotificationConfig> {
  return authFetch<NotificationConfig>(`${API_PREFIX}/users/me/notifications`);
}

/** 更新通知配置 */
export async function updateNotificationConfig(config: Partial<NotificationConfig>): Promise<NotificationConfig> {
  return authFetch<NotificationConfig>(`${API_PREFIX}/users/me/notifications`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

/** 发送测试通知 */
export async function sendTestNotification(channel: string): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/users/me/notifications/test`, {
    method: "POST",
    body: JSON.stringify({ channel }),
  });
}

// ──────────────────────────────────────────────
// 实名认证 API
// ──────────────────────────────────────────────

export interface VerificationStatus {
  status: "none" | "pending" | "verified" | "rejected";
  name?: string;
  idNumber?: string;
  frontUrl?: string;
  backUrl?: string;
  rejectReason?: string;
  verifiedAt?: string;
}

/** 查询认证状态 */
export async function getVerificationStatus(): Promise<VerificationStatus> {
  return authFetch<VerificationStatus>(`${API_PREFIX}/verification/status`);
}

/** 提交实名认证 */
export async function submitVerification(data: {
  name: string;
  idNumber: string;
  frontImageId: string;
  backImageId: string;
}): Promise<VerificationStatus> {
  return authFetch<VerificationStatus>(`${API_PREFIX}/verification`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 上传证件照片，返回文件 ID */
export async function uploadVerificationImage(file: File): Promise<{ id: string; url: string }> {
  const token = getAccessToken();
  if (!token) throw new Error("未登录");

  const formData = new FormData();
  formData.append("file", file);

  const url = buildApiUrl(`${API_PREFIX}/verification/upload`);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`上传失败 ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) throw new Error(json.message || "上传失败");
    return json.data;
  }
  return json;
}
