/**
 * Admin 认证 API 客户端
 *
 * 处理登录、登出、Token 刷新等认证相关请求。
 * Token 存储在 localStorage，自动附加到请求头。
 */

import { buildApiUrl } from "./http";

const API_PREFIX = "/api/v1";

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

export interface UserInfo {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserInfo;
  tokens: TokenResponse;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
  inviteCode?: string;
  captchaToken?: string;
  emailCode?: string;
}

// ──────────────────────────────────────────────
// Token 存储
// ──────────────────────────────────────────────

const TOKEN_KEY = "toaiapi_access_token";
const REFRESH_TOKEN_KEY = "toaiapi_refresh_token";
const USER_KEY = "toaiapi_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function setAuthData(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuthData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ──────────────────────────────────────────────
// HTTP 请求封装
// ──────────────────────────────────────────────

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  // 仅有 body 时设置 Content-Type，避免 Fastify 报 "Body cannot be empty" 错误
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  // 后端返回格式: { code, message, data }
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) {
      throw new Error(json.message || "API Error");
    }
    return json.data as T;
  }

  return json as T;
}

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

/**
 * 管理员登录
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>(`${API_PREFIX}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // 验证是否为管理员角色
  const adminRoles = ["admin", "super_admin"];
  if (!adminRoles.includes(data.user.role.toLowerCase())) {
    throw new Error("权限不足：仅管理员可访问后台");
  }

  setAuthData(data);
  return data;
}

/**
 * 用户注册
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>(`${API_PREFIX}/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setAuthData(data);
  return data;
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  try {
    await authFetch<void>(`${API_PREFIX}/auth/logout`, {
      method: "POST",
    });
  } finally {
    clearAuthData();
  }
}

/**
 * 刷新 Token
 */
export async function refreshTokens(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const data = await authFetch<TokenResponse>(`${API_PREFIX}/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

  return data;
}

/**
 * 获取当前用户信息（从本地存储）
 */
export function getCurrentUser(): UserInfo | null {
  return getStoredUser();
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * 检查是否为管理员
 */
export function isAdmin(): boolean {
  const user = getStoredUser();
  if (!user) return false;
  return ["admin", "super_admin"].includes(user.role.toLowerCase());
}
