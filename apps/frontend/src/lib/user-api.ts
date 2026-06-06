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
export async function createApiKey(name?: string): Promise<CreateApiKeyResult> {
  return authFetch<CreateApiKeyResult>(`${API_PREFIX}/api-keys`, {
    method: "POST",
    body: JSON.stringify({ name: name || undefined }),
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
