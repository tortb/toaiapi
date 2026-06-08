/**
 * 用户端 API 客户端
 *
 * 封装用户个人信息、API Key、分析、排行榜、通知等请求。
 */

import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";
import { buildApiUrl } from "./http";

const API_PREFIX = "/api/v1";

type JsonRecord = Record<string, any>;

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const payload = JSON.parse(text);
    if (payload?.message) return String(payload.message);
  } catch {
    // fallback below
  }
  return text || `API Error ${res.status}`;
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  let token = getAccessToken();
  if (!token) throw new Error("未登录");

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (init?.body) headers["Content-Type"] = "application/json";
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
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("登录已过期");
    }
  }

  if (!res.ok) throw new Error(await readErrorMessage(res));
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) throw new Error(json.message || "API Error");
    return json.data as T;
  }
  return json as T;
}

async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers as Record<string, string>),
    },
    credentials: "omit",
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) throw new Error(json.message || "API Error");
    return json.data as T;
  }
  return json as T;
}

function periodToDays(period: string): number {
  const normalized = period.toLowerCase();
  if (normalized === "24h" || normalized === "today") return 1;
  if (normalized === "30d" || normalized === "month") return 30;
  if (normalized === "90d") return 90;
  if (normalized === "year") return 365;
  return 7;
}

export interface UserApiKey {
  id: string;
  name: string | null;
  keyPrefix: string;
  key?: string;
  isActive: boolean;
  status?: string;
  expiresAt: string | null;
  rateLimit: number | null;
  tokenLimit: number | null;
  modelLimit: string[];
  ipWhitelist: string[];
  lastUsedAt: string | null;
  totalRequests: number;
  createdAt: string;
  usageToday?: number;
  usage30d?: number;
  group?: { id: string; name: string } | null;
  rpmLimit?: number | null;
  tpmLimit?: number | null;
}

export interface CreateApiKeyResult extends UserApiKey {
  key: string;
  keys?: UserApiKey[];
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  status?: string;
  createdAt: string;
  realNameVerification?: RealNameVerification | null;
}

export interface RealNameVerification {
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  type?: string | null;
  realName?: string | null;
  name?: string | null;
  idCard?: string | null;
  idCardNumber?: string | null;
  verifiedAt?: string | null;
  rejectReason?: string | null;
}

export async function getUserProfile(): Promise<UserProfile> {
  return authFetch<UserProfile>(`${API_PREFIX}/users/me`);
}

export async function updateUserProfile(data: {
  displayName?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  return authFetch<UserProfile>(`${API_PREFIX}/users/me`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/auth/change-password`, {
    method: "POST",
    body: JSON.stringify({
      currentPassword: data.oldPassword,
      newPassword: data.newPassword,
    }),
  });
}

export async function getUserApiKeys(): Promise<UserApiKey[]> {
  const items = await authFetch<JsonRecord[]>(`${API_PREFIX}/api-keys`);
  return items.map(normalizeApiKey);
}

export async function createApiKey(params: {
  name?: string;
}): Promise<CreateApiKeyResult> {
  const result = await authFetch<JsonRecord>(`${API_PREFIX}/api-keys`, {
    method: "POST",
    body: JSON.stringify({
      name: params.name || undefined,
    }),
  });
  return normalizeApiKey(result) as CreateApiKeyResult;
}

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
  const result = await authFetch<JsonRecord>(`${API_PREFIX}/api-keys/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return normalizeApiKey(result);
}

export async function enableApiKey(id: string): Promise<UserApiKey> {
  return normalizeApiKey(await authFetch<JsonRecord>(`${API_PREFIX}/api-keys/${id}/enable`, { method: "PATCH" }));
}

export async function disableApiKey(id: string): Promise<UserApiKey> {
  return normalizeApiKey(await authFetch<JsonRecord>(`${API_PREFIX}/api-keys/${id}/disable`, { method: "PATCH" }));
}

export async function deleteApiKey(id: string): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/api-keys/${id}`, { method: "DELETE" });
}

export async function deleteCurrentUser(): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/users/me`, { method: "DELETE" });
}

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
  cost?: number;
}

export interface CallTrendItem {
  date: string;
  calls: number;
  tokens: number;
  cost?: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  costDistribution: CostDistributionItem[];
  modelCallAnalysis: ModelCallItem[];
  callTrend: CallTrendItem[];
}

export async function getAnalytics(period: string = "7d"): Promise<AnalyticsResponse> {
  const raw = await authFetch<JsonRecord>(`${API_PREFIX}/balance/analytics?days=${periodToDays(period)}`);
  const ranking = raw.model_ranking ?? raw.modelRanking ?? raw.modelCallAnalysis ?? [];
  return {
    summary: {
      totalUsers: raw.summary?.totalUsers ?? 0,
      totalQuota: raw.summary?.totalQuota ?? raw.overview?.total_cost ?? 0,
      totalTokens: raw.summary?.totalTokens ?? raw.overview?.total_tokens ?? 0,
      avgRpm: raw.summary?.avgRpm ?? 0,
      avgTpm: raw.summary?.avgTpm ?? 0,
    },
    costDistribution: (raw.costDistribution ?? ranking).map((item: JsonRecord) => ({
      model: item.model,
      cost: item.cost ?? 0,
      percentage: item.percentage ?? 0,
    })),
    modelCallAnalysis: ranking.map((item: JsonRecord) => ({
      model: item.model ?? item.modelId ?? item.model_id ?? "-",
      calls: item.calls ?? item.requests ?? 0,
      tokens: item.tokens ?? 0,
      cost: item.cost ?? 0,
    })),
    callTrend: (raw.callTrend ?? raw.call_trend ?? []).map(normalizeCallTrend),
  };
}

export async function getCallTrend(period: string = "7d"): Promise<CallTrendItem[]> {
  const raw = await authFetch<JsonRecord[]>(`${API_PREFIX}/balance/analytics/call-trend?days=${periodToDays(period)}`);
  return raw.map(normalizeCallTrend);
}

export async function getModelRanking(period: string = "7d"): Promise<ModelCallItem[]> {
  const raw = await authFetch<JsonRecord[]>(`${API_PREFIX}/balance/analytics/model-ranking?days=${periodToDays(period)}`);
  return raw.map((item) => ({
    model: item.model ?? item.modelId ?? item.model_id ?? "-",
    calls: item.calls ?? item.requests ?? 0,
    tokens: item.tokens ?? 0,
    cost: item.cost ?? 0,
  }));
}

export interface LeaderboardModel {
  rank: number;
  model: string;
  vendor: string;
  requests: number;
  tokens: number;
  change: number;
}

export interface VendorMarketShare {
  vendor: string;
  tokens: number;
  percentage: number;
}

export interface TrendingModel {
  model: string;
  vendor: string;
  change: number;
  currentRank: number;
}

export interface LeaderboardResponse {
  hotModels: LeaderboardModel[];
  leaderboard: LeaderboardModel[];
  marketShare: VendorMarketShare[];
  rising: TrendingModel[];
  falling: TrendingModel[];
}

export async function getLeaderboard(period: string = "week"): Promise<LeaderboardResponse> {
  const raw = await publicFetch<JsonRecord>(`${API_PREFIX}/leaderboard?period=${encodeURIComponent(period.toUpperCase())}`);
  const hotModels = (raw.hotModels ?? raw.hot_models ?? []).map(normalizeLeaderboardModel);
  const marketShare = (raw.marketShare ?? raw.vendorShare ?? raw.vendor_share ?? []).map(normalizeVendorShare);
  const trending = raw.trending ?? {};
  const rising = (raw.rising ?? trending.rising ?? []).map(normalizeTrendingModel);
  const falling = (raw.falling ?? trending.falling ?? []).map(normalizeTrendingModel);
  return {
    hotModels,
    leaderboard: raw.leaderboard ? raw.leaderboard.map(normalizeLeaderboardModel) : hotModels,
    marketShare,
    rising,
    falling,
  };
}

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
  lowBalanceThreshold: number;
  channels: {
    email: NotificationChannel;
    webhook: NotificationChannel;
    wxpusher: NotificationChannel;
    wechatWork: NotificationChannel;
    dingtalk: NotificationChannel;
    feishu: NotificationChannel;
  };
}

export async function getNotificationConfig(): Promise<NotificationConfig> {
  const raw = await authFetch<JsonRecord>(`${API_PREFIX}/users/me/notifications`);
  return normalizeNotificationConfig(raw);
}

export async function updateNotificationConfig(config: Partial<NotificationConfig>): Promise<NotificationConfig> {
  const payload = denormalizeNotificationConfig(config);
  const raw = await authFetch<JsonRecord>(`${API_PREFIX}/users/me/notifications`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeNotificationConfig(raw);
}

export async function sendTestNotification(channel: string): Promise<void> {
  return authFetch<void>(`${API_PREFIX}/users/me/notifications/test`, {
    method: "POST",
    body: JSON.stringify({ channel }),
  });
}

function normalizeApiKey(item: JsonRecord): UserApiKey {
  return {
    ...item,
    id: item.id,
    name: item.name ?? null,
    keyPrefix: item.keyPrefix ?? item.key_prefix ?? "",
    key: item.key,
    isActive: item.isActive ?? item.is_active ?? item.status === "ACTIVE",
    status: item.status,
    expiresAt: item.expiresAt ?? item.expires_at ?? null,
    rateLimit: item.rateLimit ?? item.rate_limit ?? null,
    tokenLimit: item.tokenLimit ?? item.token_limit ?? null,
    modelLimit: Array.isArray(item.modelLimit ?? item.model_limit) ? item.modelLimit ?? item.model_limit : [],
    ipWhitelist: Array.isArray(item.ipWhitelist ?? item.ip_whitelist) ? item.ipWhitelist ?? item.ip_whitelist : [],
    lastUsedAt: item.lastUsedAt ?? item.last_used_at ?? null,
    totalRequests: item.totalRequests ?? item.total_requests ?? 0,
    createdAt: item.createdAt ?? item.created_at ?? "",
    usageToday: item.usageToday ?? item.usage_today,
    usage30d: item.usage30d ?? item.usage_30d,
    group: item.group ?? null,
    rpmLimit: item.rpmLimit ?? item.rpm_limit ?? null,
    tpmLimit: item.tpmLimit ?? item.tpm_limit ?? null,
  };
}

function normalizeCallTrend(item: JsonRecord): CallTrendItem {
  return {
    date: item.date,
    calls: item.calls ?? item.requests ?? 0,
    tokens: item.tokens ?? 0,
    cost: item.cost ?? 0,
  };
}

function normalizeLeaderboardModel(item: JsonRecord, index: number): LeaderboardModel {
  return {
    rank: item.rank ?? index + 1,
    model: item.model ?? item.name ?? "-",
    vendor: item.vendor ?? item.provider ?? "-",
    requests: item.requests ?? 0,
    tokens: item.tokens ?? 0,
    change: item.change ?? item.rankChange ?? item.rank_change ?? 0,
  };
}

function normalizeVendorShare(item: JsonRecord): VendorMarketShare {
  const total = item.tokens ?? item.requests ?? 0;
  return {
    vendor: item.vendor ?? item.provider ?? "-",
    tokens: total,
    percentage: item.percentage ?? item.share ?? 0,
  };
}

function normalizeTrendingModel(item: JsonRecord, index: number): TrendingModel {
  return {
    model: item.model ?? item.name ?? "-",
    vendor: item.vendor ?? item.provider ?? "-",
    change: item.change ?? item.changePercent ?? item.change_percent ?? 0,
    currentRank: item.currentRank ?? item.current_rank ?? index + 1,
  };
}

function normalizeNotificationConfig(raw: JsonRecord): NotificationConfig {
  return {
    email: raw.email ?? null,
    subscriptions: {
      lowBalance: raw.subscriptions?.lowBalance ?? raw.email_enabled ?? true,
      promotions: raw.subscriptions?.promotions ?? false,
      periodic: raw.subscriptions?.periodic ?? false,
      announcements: raw.subscriptions?.announcements ?? false,
      priceChanges: raw.subscriptions?.priceChanges ?? false,
    },
    lowBalanceThreshold: raw.lowBalanceThreshold ?? raw.low_balance_threshold ?? 1000,
    channels: {
      email: { enabled: raw.channels?.email?.enabled ?? raw.email_enabled ?? true },
      webhook: { enabled: raw.channels?.webhook?.enabled ?? raw.webhook_enabled ?? false, url: raw.webhook_url ?? raw.channels?.webhook?.url },
      wxpusher: { enabled: raw.channels?.wxpusher?.enabled ?? raw.wxpusher_enabled ?? false, uid: raw.wxpusher_uid ?? raw.channels?.wxpusher?.uid },
      wechatWork: { enabled: raw.channels?.wechatWork?.enabled ?? false },
      dingtalk: { enabled: raw.channels?.dingtalk?.enabled ?? false },
      feishu: { enabled: raw.channels?.feishu?.enabled ?? false },
    },
  };
}

function denormalizeNotificationConfig(config: Partial<NotificationConfig>): JsonRecord {
  return {
    email_enabled: config.channels?.email?.enabled ?? config.subscriptions?.lowBalance,
    webhook_enabled: config.channels?.webhook?.enabled,
    webhook_url: config.channels?.webhook?.url,
    wxpusher_enabled: config.channels?.wxpusher?.enabled,
    wxpusher_uid: config.channels?.wxpusher?.uid,
    low_balance_threshold: config.lowBalanceThreshold,
  };
}
