import type { AuthResponse, User, ApiKey, Balance, Transaction, RequestLog, Model, PublicModel, ChannelStatus, PaymentMethod, RechargeOrder, OrderDetail } from '@/types';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

/** 最大重试次数（防止无限递归） */
const MAX_RETRY_COUNT = 1;

/** 是否正在刷新 token，防止并发刷新 */
let isRefreshing = false;
/** 等待 token 刷新完成的请求队列 */
let refreshQueue: Array<() => void> = [];

/**
 * 刷新 access token
 * SECURITY: 刷新失败时返回 false，由调用方处理登出
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    const tokens = data.data || data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    // SECURITY: 同步更新 cookie 供 middleware 使用
    document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=900; SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}

/**
 * 清除认证状态并跳转登录
 */
function handleAuthFailure(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * 通用请求方法（带 401 自动刷新）
 * SECURITY: 限制最大重试次数，防止无限递归
 *
 * @param path - API 路径
 * @param options - fetch 选项
 * @param retryCount - 当前重试次数（内部使用）
 * @returns 响应数据
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // 401 自动刷新 token（限制重试次数）
  if (response.status === 401 && token && retryCount < MAX_RETRY_COUNT) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshAccessToken();
      isRefreshing = false;

      if (refreshed) {
        // 刷新成功，执行等待队列中的请求
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        // 重试当前请求（增加重试计数）
        return request<T>(path, options, retryCount + 1);
      } else {
        // 刷新失败，清除认证状态
        refreshQueue = [];
        handleAuthFailure();
        throw new Error('Session expired');
      }
    } else {
      // 已有刷新请求在进行中，等待刷新完成后重试
      return new Promise<T>((resolve) => {
        refreshQueue.push(() => {
          resolve(request<T>(path, options, retryCount + 1));
        });
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return (data.data ?? data) as T;
}

/**
 * API 客户端
 *
 * 提供所有用户端 API 的类型安全调用方法。
 */
export const api = {
  // ──────────────────────────────────────────────
  // 认证
  // ──────────────────────────────────────────────

  auth: {
    /** 用户注册 */
    register: (email: string, password: string, displayName?: string) =>
      request<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
      }),

    /** 用户登录 */
    login: (email: string, password: string) =>
      request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    /** 刷新 Token */
    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    /** 登出 */
    logout: () =>
      request<void>('/api/v1/auth/logout', { method: 'POST' }),

    /** 修改密码 */
    changePassword: (currentPassword: string, newPassword: string) =>
      request<void>('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    /** 忘记密码 */
    forgotPassword: (email: string) =>
      request<void>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    /** 重置密码 */
    resetPassword: (token: string, newPassword: string) =>
      request<void>('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  // ──────────────────────────────────────────────
  // 用户
  // ──────────────────────────────────────────────

  user: {
    /** 获取当前用户信息 */
    getMe: () => request<User>('/api/v1/users/me'),

    /** 更新当前用户信息 */
    updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
      request<User>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    /** 注销账号（软删除） */
    deleteMe: () =>
      request<void>('/api/v1/users/me', { method: 'DELETE' }),
  },

  // ──────────────────────────────────────────────
  // API Keys
  // ──────────────────────────────────────────────

  apiKeys: {
    /** 获取当前用户的 API Key 列表 */
    list: () => request<ApiKey[]>('/api/v1/api-keys'),

    /** 创建 API Key（仅此次返回完整 Key） */
    create: (data: { name?: string; expiresAt?: string; rateLimit?: number; tokenLimit?: number; modelLimit?: string[] }) =>
      request<ApiKey>('/api/v1/api-keys', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** 删除 API Key */
    delete: (id: string) =>
      request<void>(`/api/v1/api-keys/${id}`, { method: 'DELETE' }),

    /** 启用/禁用 API Key */
    toggle: (id: string, enable: boolean) =>
      request<ApiKey>(`/api/v1/api-keys/${id}/${enable ? 'enable' : 'disable'}`, {
        method: 'PATCH',
      }),
  },

  // ──────────────────────────────────────────────
  // 余额
  // ──────────────────────────────────────────────

  balance: {
    /** 获取余额（分） */
    get: () => request<Balance>('/api/v1/balance'),

    /** 获取交易流水 */
    getTransactions: (page = 1, pageSize = 20) =>
      request<{ items: Transaction[]; total: number; page: number; pageSize: number; totalPages: number }>(
        `/api/v1/balance/transactions?page=${page}&pageSize=${pageSize}`
      ),

    /** 获取请求日志 */
    getLogs: (page = 1, pageSize = 20) =>
      request<{ items: RequestLog[]; total: number; page: number; pageSize: number; totalPages: number }>(
        `/api/v1/balance/logs?page=${page}&pageSize=${pageSize}`
      ),
  },

  // ──────────────────────────────────────────────
  // 支付
  // ──────────────────────────────────────────────

  payment: {
    /** 获取可用支付方式（无需认证） */
    getMethods: () =>
      request<PaymentMethod[]>('/api/v1/payment/methods'),

    /** 创建充值订单 */
    createOrder: (data: { amount: number; paymentMethod: string }) =>
      request<RechargeOrder>('/api/v1/payment/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** 获取订单列表 */
    getOrders: async (page = 1, pageSize = 20) => {
      const res = await request<{ data: OrderDetail[]; total: number; page: number; pageSize: number; totalPages: number }>(
        `/api/v1/payment/orders?page=${page}&pageSize=${pageSize}`
      );
      return { items: res.data ?? [], total: res.total, page: res.page, pageSize: res.pageSize, totalPages: res.totalPages };
    },

    /** 获取订单详情 */
    getOrder: (orderNo: string) =>
      request<OrderDetail>(`/api/v1/payment/orders/${orderNo}`),

    /** 取消订单 */
    cancelOrder: (orderNo: string) =>
      request<void>(`/api/v1/payment/orders/${orderNo}/cancel`, {
        method: 'POST',
      }),
  },

  // ──────────────────────────────────────────────
  // 模型
  // ──────────────────────────────────────────────

  models: {
    /** 获取可用模型列表（需 API Key） */
    list: () => request<{ object: string; data: Model[] }>('/api/v1/models'),

    /** 获取公开模型列表（含定价和能力，无需认证） */
    listPublic: () => request<{ data: PublicModel[] }>('/api/v1/models/public'),
  },

  // ──────────────────────────────────────────────
  // 服务状态
  // ──────────────────────────────────────────────

  status: {
    /** 获取渠道状态（无需认证） */
    get: () => request<{ data: ChannelStatus[] }>('/api/v1/status'),
  },
};
