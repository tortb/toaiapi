import type {
  AuthResponse,
  TokenResponse,
  AdminUser,
  Provider,
  CreateProviderInput,
  UpdateProviderInput,
  Channel,
  CreateChannelInput,
  UpdateChannelInput,
  Model,
  CreateModelInput,
  UpdateModelInput,
  UpsertPricingInput,
  AdminUserListItem,
  AdminUserDetail,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  PaginatedData,
  DashboardStats,
} from '@/types';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

// ──────────────────────────────────────────────
// Token 刷新机制
// ──────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('admin-refresh-token')
    : null;
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;

    const data = await response.json();
    const tokens: TokenResponse = data.data || data;
    localStorage.setItem('admin-access-token', tokens.accessToken);
    localStorage.setItem('admin-refresh-token', tokens.refreshToken);
    // SECURITY: 同步更新 cookie 供 middleware 使用
    document.cookie = `admin-accessToken=${tokens.accessToken}; path=/; max-age=900; SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}

function handleAuthFailure(): void {
  localStorage.removeItem('admin-access-token');
  localStorage.removeItem('admin-refresh-token');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// ──────────────────────────────────────────────
// 通用请求方法
// ──────────────────────────────────────────────

/** 最大重试次数（防止无限递归） */
const MAX_RETRY_COUNT = 1;

/**
 * 通用请求方法（带 401 自动刷新）
 * SECURITY: 限制最大重试次数，防止无限递归
 */
async function request<T>(path: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin-access-token')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // 401 自动刷新（限制重试次数）
  if (response.status === 401 && token && retryCount < MAX_RETRY_COUNT) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshAccessToken();
      isRefreshing = false;
      if (refreshed) {
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return request<T>(path, options, retryCount + 1);
      }
      refreshQueue = [];
      handleAuthFailure();
      throw new Error('会话已过期');
    }
    return new Promise<T>((resolve) => {
      refreshQueue.push(() => resolve(request<T>(path, options, retryCount + 1)));
    });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return (data.data ?? data) as T;
}

// ──────────────────────────────────────────────
// API 模块
// ──────────────────────────────────────────────

export const api = {
  // 认证
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    refresh: (refreshToken: string) =>
      request<TokenResponse>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    logout: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),
    getMe: () => request<AdminUser>('/api/v1/users/me'),
  },

  // Dashboard 统计（聚合多个接口）
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const [providers, channels, models, users] = await Promise.all([
        request<PaginatedData<Provider>>('/api/v1/admin/providers?page=1&pageSize=1'),
        request<PaginatedData<Channel>>('/api/v1/admin/channels?page=1&pageSize=1'),
        request<PaginatedData<Model>>('/api/v1/admin/models?page=1&pageSize=1'),
        request<PaginatedData<AdminUserListItem>>('/api/v1/admin/users?page=1&pageSize=1'),
      ]);
      return {
        userCount: users.total,
        providerCount: providers.total,
        channelCount: channels.total,
        modelCount: models.total,
        todayRequests: 0,
        todayTokens: 0,
      };
    },
  },

  // Provider 管理
  providers: {
    list: (page = 1, pageSize = 20) =>
      request<PaginatedData<Provider>>(`/api/v1/admin/providers?page=${page}&pageSize=${pageSize}`),
    get: (id: string) =>
      request<Provider>(`/api/v1/admin/providers/${id}`),
    create: (data: CreateProviderInput) =>
      request<Provider>('/api/v1/admin/providers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateProviderInput) =>
      request<Provider>(`/api/v1/admin/providers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/api/v1/admin/providers/${id}`, { method: 'DELETE' }),
  },

  // Channel 管理
  channels: {
    list: (page = 1, pageSize = 20, providerId?: string) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (providerId) params.set('providerId', providerId);
      return request<PaginatedData<Channel>>(`/api/v1/admin/channels?${params}`);
    },
    get: (id: string) =>
      request<Channel>(`/api/v1/admin/channels/${id}`),
    create: (data: CreateChannelInput) =>
      request<Channel>('/api/v1/admin/channels', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateChannelInput) =>
      request<Channel>(`/api/v1/admin/channels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    enable: (id: string) =>
      request<Channel>(`/api/v1/admin/channels/${id}/enable`, { method: 'PATCH' }),
    disable: (id: string) =>
      request<Channel>(`/api/v1/admin/channels/${id}/disable`, { method: 'PATCH' }),
    delete: (id: string) =>
      request<void>(`/api/v1/admin/channels/${id}`, { method: 'DELETE' }),
  },

  // Model 管理
  models: {
    list: (page = 1, pageSize = 20) =>
      request<PaginatedData<Model>>(`/api/v1/admin/models?page=${page}&pageSize=${pageSize}`),
    get: (id: string) =>
      request<Model>(`/api/v1/admin/models/${id}`),
    create: (data: CreateModelInput) =>
      request<Model>('/api/v1/admin/models', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateModelInput) =>
      request<Model>(`/api/v1/admin/models/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/api/v1/admin/models/${id}`, { method: 'DELETE' }),
    upsertPricing: (id: string, data: UpsertPricingInput) =>
      request<Model>(`/api/v1/admin/models/${id}/pricing`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // User 管理
  users: {
    list: (page = 1, pageSize = 20, role?: string, status?: string) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      return request<PaginatedData<AdminUserListItem>>(`/api/v1/admin/users?${params}`);
    },
    get: (id: string) =>
      request<AdminUserDetail>(`/api/v1/admin/users/${id}`),
    updateRole: (id: string, data: UpdateUserRoleInput) =>
      request<AdminUserListItem>(`/api/v1/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, data: UpdateUserStatusInput) =>
      request<AdminUserListItem>(`/api/v1/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
};
