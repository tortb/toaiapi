import type { AuthResponse, User, ApiKey, Balance, Transaction, RequestLog, Model } from '@/types';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

/** 是否正在刷新 token，防止并发刷新 */
let isRefreshing = false;
/** 等待 token 刷新完成的请求队列 */
let refreshQueue: Array<() => void> = [];

/**
 * 刷新 access token
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
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
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

  // 401 自动刷新 token
  if (response.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshAccessToken();
      isRefreshing = false;

      if (refreshed) {
        // 刷新成功，执行等待队列中的请求
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        // 重试当前请求
        return request<T>(path, options);
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
          resolve(request<T>(path, options));
        });
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * API 客户端
 */
export const api = {
  // 认证
  auth: {
    register: (email: string, password: string, displayName?: string) =>
      request<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    logout: () =>
      request<void>('/api/v1/auth/logout', { method: 'POST' }),

    changePassword: (currentPassword: string, newPassword: string) =>
      request<void>('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    forgotPassword: (email: string) =>
      request<void>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string) =>
      request<void>('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  // 用户
  user: {
    getMe: () => request<User>('/api/v1/users/me'),

    updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
      request<User>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteMe: () =>
      request<void>('/api/v1/users/me', { method: 'DELETE' }),
  },

  // API Keys
  apiKeys: {
    list: () => request<ApiKey[]>('/api/v1/api-keys'),

    create: (data: { name?: string; expiresAt?: string; rateLimit?: number; tokenLimit?: number; modelLimit?: string[] }) =>
      request<ApiKey>('/api/v1/api-keys', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<void>(`/api/v1/api-keys/${id}`, { method: 'DELETE' }),

    toggle: (id: string, enable: boolean) =>
      request<ApiKey>(`/api/v1/api-keys/${id}/${enable ? 'enable' : 'disable'}`, {
        method: 'PATCH',
      }),
  },

  // 余额
  balance: {
    get: () => request<Balance>('/api/v1/balance'),

    getTransactions: (page = 1, pageSize = 20) =>
      request<{ items: Transaction[]; total: number; page: number; pageSize: number; totalPages: number }>(
        `/api/v1/balance/transactions?page=${page}&pageSize=${pageSize}`
      ),

    getLogs: (page = 1, pageSize = 20) =>
      request<{ items: RequestLog[]; total: number; page: number; pageSize: number; totalPages: number }>(
        `/api/v1/balance/logs?page=${page}&pageSize=${pageSize}`
      ),
  },

  // 模型
  models: {
    list: () => request<{ object: string; data: Model[] }>('/api/v1/models'),
  },
};
