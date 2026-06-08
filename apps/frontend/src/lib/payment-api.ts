/**
 * 用户端支付 API
 *
 * 封装充值、订单、余额等用户端 API 请求。
 * 自动附加 JWT Token。
 */

import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";
import { buildApiUrl } from "./http";

const API_PREFIX = "/api/v1";

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const payload = JSON.parse(text);
    if (payload?.message) return String(payload.message);
  } catch {
    // fallback below
  }
  return text || "API Error " + res.status;
}

function unwrapApiResponse<T>(json: unknown): T {
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    const payload = json as { code: number | string; message?: string; data: T };
    if (payload.code !== 0) throw new Error(payload.message || "API Error");
    return payload.data;
  }
  return json as T;
}

async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers as Record<string, string>),
    },
    credentials: "omit",
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  if (res.status === 204) return undefined as T;
  return unwrapApiResponse<T>(await res.json());
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  let token = getAccessToken();
  if (!token) {
    token = (await refreshTokens()).accessToken;
  }

  const headers: Record<string, string> = {
    Authorization: "Bearer " + token,
    ...(init?.headers as Record<string, string>),
  };

  if (init?.body) headers["Content-Type"] = "application/json";

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

  return unwrapApiResponse<T>(await res.json());
}

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

export interface BalanceInfo {
  amount: number;
  frozen: number;
  available: number;
}

export interface BalanceStats {
  balance: BalanceInfo;
  monthlySpend: number;
  monthlyRecharge: number;
  monthlyRequests: number;
  monthlyPromptTokens: number;
  monthlyCompletionTokens: number;
  monthlyTotalTokens: number;
  today?: { requests: number; costActual: number; costStandard: number; tokensInput: number; tokensOutput: number; tokensTotal: number };
  cumulative?: { tokensInput: number; tokensOutput: number; tokensTotal: number };
  apiKeys?: { total: number; active: number; limit: number };
  performance?: { successRate: number; avgLatencyMs: number; errorRate: number };
  platformBreakdown?: Array<{ platform: string; requests: number; percentage: number }>;
  modelDistribution?: Array<{ model: string; requests: number; percentage: number }>;
  tokenTrend?: Array<{ label: string; input: number; output: number; total: number; cost?: number }>;
  recentUsage?: Array<{ id: string; model: string; timestamp: string; costActual: number; costStandard: number; tokens: number }>;
}


type RawTokenTrendItem = {
  label?: unknown;
  date?: unknown;
  input?: unknown;
  output?: unknown;
  total?: unknown;
  tokens?: unknown;
  tokensInput?: unknown;
  tokensOutput?: unknown;
  tokensTotal?: unknown;
  promptTokens?: unknown;
  completionTokens?: unknown;
  totalTokens?: unknown;
  prompt_tokens?: unknown;
  completion_tokens?: unknown;
  total_tokens?: unknown;
  cost?: unknown;
};

function toNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : fallback;
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toString(value: unknown, fallback: string): string {
  return typeof value === "string" && value ? value : fallback;
}

function normalizeTokenTrend(value: unknown): BalanceStats["tokenTrend"] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const row = item && typeof item === "object" ? (item as RawTokenTrendItem) : {};
    const input = toNumber(row.input ?? row.tokensInput ?? row.promptTokens ?? row.prompt_tokens);
    const output = toNumber(row.output ?? row.tokensOutput ?? row.completionTokens ?? row.completion_tokens);
    const total = toNumber(row.total ?? row.tokens ?? row.tokensTotal ?? row.totalTokens ?? row.total_tokens, input + output);

    return {
      label: toString(row.label ?? row.date, `#${index + 1}`),
      input,
      output,
      total,
      cost: toNumber(row.cost),
    };
  });
}

export interface ActivePromotion {
  id: string;
  name: string;
  description: string | null;
  minAmount: number;
  bonusType: "FIXED" | "PERCENTAGE";
  bonusValue: number;
  maxBonus: number | null;
  startAt: string;
  endAt: string | null;
}

export interface PaymentMethod {
  name: string;
  displayName: string;
}

export interface CreateOrderResult {
  orderNo: string;
  amount: number;
  paymentMethod: string;
  status: string;
  payUrl: string | null;
  createdAt: string;
}

export interface OrderInfo {
  id: string;
  orderNo: string;
  amount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  status: string;
  productName: string;
  paidAt: string | null;
  createdAt: string;
}

export interface DailyBill {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
}

export interface BillItem {
  id: string;
  createdAt: string;
  endpoint: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  cost: number;
  statusCode: number;
  latencyMs: number;
  modelId: string;
  channelId: string;
}

export interface RequestLogItem {
  id: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  cost: number;
  statusCode: number;
  latencyMs: number;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  orderId: string | null;
  remark: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function normalizePaginated<T>(raw: any, page: number, pageSize: number): PaginatedResponse<T> {
  const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.data) ? raw.data : [];
  const total = toNumber(raw?.total, items.length);
  const normalizedPageSize = toNumber(raw?.pageSize ?? raw?.page_size, pageSize);
  return {
    items,
    total,
    page: toNumber(raw?.page, page),
    pageSize: normalizedPageSize,
    totalPages: toNumber(raw?.totalPages ?? raw?.total_pages, Math.max(1, Math.ceil(total / Math.max(1, normalizedPageSize)))),
  };
}

// ──────────────────────────────────────────────
// API 函数
// ──────────────────────────────────────────────

/** 获取余额 */
export async function getBalance(): Promise<BalanceInfo> {
  return authFetch<BalanceInfo>(`${API_PREFIX}/balance`);
}

/** 获取余额和消费统计 */
export async function getBalanceStats(): Promise<BalanceStats> {
  const raw = await authFetch<any>(`${API_PREFIX}/balance/stats`);
  return {
    ...raw,
    monthlySpend: raw.monthlySpend ?? 0,
    monthlyRecharge: raw.monthlyRecharge ?? 0,
    monthlyRequests: raw.monthlyRequests ?? raw.today?.requests ?? 0,
    monthlyPromptTokens: raw.monthlyPromptTokens ?? raw.today?.tokensInput ?? 0,
    monthlyCompletionTokens: raw.monthlyCompletionTokens ?? raw.today?.tokensOutput ?? 0,
    monthlyTotalTokens: raw.monthlyTotalTokens ?? raw.today?.tokensTotal ?? 0,
    tokenTrend: normalizeTokenTrend(raw.tokenTrend),
  };
}

/** 获取可用支付方式 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return publicFetch<PaymentMethod[]>(API_PREFIX + "/payment/methods");
}

/** 获取当前有效的充值活动 */
export async function getActivePromotions(amount?: number): Promise<ActivePromotion[]> {
  const params = new URLSearchParams();
  if (amount !== undefined) params.set("amount", String(amount));
  const query = params.toString();
  return publicFetch<ActivePromotion[]>(API_PREFIX + "/payment/promotions" + (query ? "?" + query : ""));
}

/** 创建充值订单 */
export async function createOrder(amount: number, paymentMethod: string): Promise<CreateOrderResult> {
  return authFetch<CreateOrderResult>(`${API_PREFIX}/payment/orders`, {
    method: "POST",
    body: JSON.stringify({ amount, paymentMethod }),
  });
}

/** 获取用户订单列表 */
export async function getUserOrders(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<OrderInfo>> {
  const raw = await authFetch<any>(`${API_PREFIX}/payment/orders?page=${page}&pageSize=${pageSize}`);
  // 后端返回 { data: [...], total, page, pageSize, totalPages }
  // 前端期望 { items: [...], total, page, pageSize, totalPages }
  return {
    items: raw.data ?? raw.items ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? page,
    pageSize: raw.pageSize ?? pageSize,
    totalPages: raw.totalPages ?? 1,
  };
}

/** 查询单个订单状态 */
export async function getOrderStatus(orderNo: string): Promise<OrderInfo> {
  const raw = await authFetch<any>(`${API_PREFIX}/payment/orders/${orderNo}`);
  // 后端返回 snake_case 字段，前端期望 camelCase
  return {
    id: raw.id,
    orderNo: raw.order_no ?? raw.orderNo,
    amount: raw.amount,
    paidAmount: raw.paid_amount ?? raw.paidAmount ?? null,
    paymentMethod: raw.payment_method ?? raw.paymentMethod ?? null,
    status: raw.status,
    productName: raw.product_name ?? raw.productName ?? "",
    paidAt: raw.paid_at ?? raw.paidAt ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
  };
}

/** 获取消费明细 */
export async function getBills(page: number = 1, pageSize: number = 20, startDate?: string, endDate?: string): Promise<PaginatedResponse<BillItem>> {
  let url = `${API_PREFIX}/balance/bills?page=${page}&pageSize=${pageSize}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  const raw = await authFetch<any>(url);
  return normalizePaginated<BillItem>(raw, page, pageSize);
}

/** 获取按天聚合的消费统计 */
export async function getDailyBills(days: number = 30): Promise<DailyBill[]> {
  const raw = await authFetch<any[]>(`${API_PREFIX}/balance/bills/daily?days=${days}`);
  return (Array.isArray(raw) ? raw : []).map((item) => ({
    date: String(item.date ?? ""),
    cost: toNumber(item.cost),
    tokens: toNumber(item.tokens),
    requests: toNumber(item.requests),
  }));
}

/** 获取请求日志 */
export async function getRequestLogs(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<RequestLogItem>> {
  const raw = await authFetch<any>(API_PREFIX + "/balance/logs?page=" + page + "&pageSize=" + pageSize);
  return normalizePaginated<RequestLogItem>(raw, page, pageSize);
}

/** 获取余额交易流水 */
export async function getTransactions(page: number = 1, pageSize: number = 20, type?: string): Promise<PaginatedResponse<TransactionItem>> {
  let url = API_PREFIX + "/balance/transactions?page=" + page + "&pageSize=" + pageSize;
  if (type) url += "&type=" + encodeURIComponent(type);
  return authFetch<PaginatedResponse<TransactionItem>>(url);
}


// ──────────────────────────────────────────────
// 兑换码 / 邀请
// ──────────────────────────────────────────────

export interface InviteStats {
  pendingReward: number;   // 待使用收益(分)
  totalReward: number;     // 总收益(分)
  inviteCount: number;     // 邀请人数
  rewardRatio: number;     // 奖励比例(%)
  inviteUrl: string;       // 邀请链接
}

export interface RedeemResult {
  amount: number;          // 兑换金额(分)
  balance: number;         // 兑换后余额(分)
}

/** 获取邀请奖励统计 */
export async function getInviteStats(): Promise<InviteStats> {
  const [stats, code] = await Promise.all([
    authFetch<any>(`${API_PREFIX}/invite/stats`),
    authFetch<any>(`${API_PREFIX}/invite/code`).catch(() => null),
  ]);
  return {
    pendingReward: stats.pendingReward ?? stats.pending_reward ?? 0,
    totalReward: stats.totalReward ?? stats.total_reward ?? 0,
    inviteCount: stats.inviteCount ?? stats.totalInvites ?? stats.total_invites ?? 0,
    rewardRatio: stats.rewardRatio ?? stats.reward_ratio ?? 0,
    inviteUrl: stats.inviteUrl ?? code?.inviteLink ?? "",
  };
}

/** 兑换码充值 */
export async function redeemCode(code: string): Promise<RedeemResult> {
  const raw = await authFetch<any>(`${API_PREFIX}/redeem`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return {
    amount: raw.amount ?? raw.reward ?? 0,
    balance: raw.balance ?? 0,
  };
}

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

export function formatAmount(yuan: number): string {
  return yuan.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return num.toLocaleString("zh-CN");
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  });
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  });
}

export function getOrderStatusLabel(status: string): { label: string; color: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    PENDING: { label: "待支付", color: "text-warning", dotColor: "bg-warning" },
    PAID: { label: "已支付", color: "text-success", dotColor: "bg-success" },
    SUCCESS: { label: "成功", color: "text-success", dotColor: "bg-success" },
    FAILED: { label: "支付失败", color: "text-red-500", dotColor: "bg-red-500" },
    REFUNDED: { label: "已退款", color: "text-gray-500", dotColor: "bg-gray-500" },
    CANCELLED: { label: "已取消", color: "text-gray-400", dotColor: "bg-gray-400" },
    EXPIRED: { label: "已过期", color: "text-gray-400", dotColor: "bg-gray-400" },
  };
  return map[status] ?? { label: status, color: "text-gray-500", dotColor: "bg-gray-400" };
}

export function getPaymentMethodLabel(method: string | null): string {
  if (!method) return "-";
  const map: Record<string, string> = {
    WECHAT_PAY: "微信支付",
    ALIPAY: "支付宝",
    EPAY_ALIPAY: "易支付-支付宝",
    EPAY_WECHAT: "易支付-微信",
  };
  return map[method] ?? method;
}
