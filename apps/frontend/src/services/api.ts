import type { ApiResponse, AuthResponse, User, ApiKey, Balance, Transaction, RequestLog, Model } from '@/types';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

/**
 * 通用请求方法
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
  },

  // 用户
  user: {
    getMe: () => request<User>('/api/v1/users/me'),

    updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
      request<User>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
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
