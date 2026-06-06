/**
 * 用户端支付 API
 *
 * 封装充值、订单、余额等用户端 API 请求。
 * 自动附加 JWT Token。
 */

import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";
import { buildApiUrl } from "./http";

const API_PREFIX = "/api/v1";

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  let token = getAccessToken();
  if (!token) throw new Error("未登录");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string>),
  };

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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  return authFetch<BalanceStats>(`${API_PREFIX}/balance/stats`);
}

/** 获取可用支付方式 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await fetch(buildApiUrl(`${API_PREFIX}/payment/methods`));
  const json = await res.json();
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    return json.data;
  }
  return json;
}

/** 获取当前有效的充值活动 */
export async function getActivePromotions(amount?: number): Promise<ActivePromotion[]> {
  const params = amount ? `?amount=${amount}` : "";
  const res = await fetch(buildApiUrl(`${API_PREFIX}/payment/promotions${params}`));
  const json = await res.json();
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    return json.data;
  }
  return json;
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
  return authFetch<PaginatedResponse<OrderInfo>>(`${API_PREFIX}/payment/orders?page=${page}&pageSize=${pageSize}`);
}

/** 获取消费明细 */
export async function getBills(page: number = 1, pageSize: number = 20, startDate?: string, endDate?: string): Promise<PaginatedResponse<BillItem>> {
  let url = `${API_PREFIX}/balance/bills?page=${page}&pageSize=${pageSize}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  return authFetch<PaginatedResponse<BillItem>>(url);
}

/** 获取按天聚合的消费统计 */
export async function getDailyBills(days: number = 30): Promise<DailyBill[]> {
  return authFetch<DailyBill[]>(`${API_PREFIX}/balance/bills/daily?days=${days}`);
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

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

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

export function getPaymentMethodLabel(method: string | null): string {
  if (!method) return "-";
  const map: Record<string, string> = {
    WECHAT_PAY: "微信支付",
    ALIPAY: "支付宝",
    EPAY_ALIPAY: "易支付-支付宝",
    EPAY_WECHAT: "易支付-微信",
    EPAY_QQ: "易支付-QQ",
  };
  return map[method] ?? method;
}
