/**
 * Admin API 客户端
 *
 * 封装所有 Admin 后台 API 请求。
 * 自动附加 JWT Token。
 */

import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";

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

function buildUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return cleanPath;
  }
  if (API_BASE && API_BASE.length > 0) {
    return `${API_BASE.replace(/\/$/, "")}${cleanPath}`;
  }
  return `http://localhost:3001${cleanPath}`;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  let token = getAccessToken();

  if (!token) {
    throw new Error("未登录");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string>),
  };

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

  return res.json() as Promise<T>;
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
  return adminFetch<DashboardData>(`/admin/dashboard${query ? `?${query}` : ""}`);
}

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

/**
 * 格式化金额（分 → 元）
 */
export function formatAmount(fen: number): string {
  return (fen / 100).toLocaleString("zh-CN", {
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

/**
 * 订单状态映射
 */
export function getOrderStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: "待支付", color: "text-warning" },
    PAID: { label: "已支付", color: "text-success" },
    FAILED: { label: "支付失败", color: "text-red-500" },
    REFUNDED: { label: "已退款", color: "text-gray-500" },
    CANCELLED: { label: "已取消", color: "text-gray-400" },
  };
  return map[status] ?? { label: status, color: "text-gray-500" };
}

/**
 * 渠道状态映射
 */
export function getChannelStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "正常", color: "text-success" },
    RATE_LIMITED: { label: "限流", color: "text-warning" },
    ERROR: { label: "异常", color: "text-red-500" },
    DISABLED: { label: "已禁用", color: "text-gray-400" },
  };
  return map[status] ?? { label: status, color: "text-gray-500" };
}
