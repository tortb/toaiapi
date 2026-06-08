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
  refreshToken?: string;
  refreshExpiresIn?: number;
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
  captchaVerifyParam?: string;
  emailCode?: string;
}


export interface SendVerificationCodePayload {
  email: string;
  purpose?: string;
  captchaVerifyParam?: string;
}

// ──────────────────────────────────────────────
// Token 存储
// ──────────────────────────────────────────────

export const AUTH_SYNC_EVENT = "toaiapi-auth-sync";

const TOKEN_KEY = "toaiapi_access_token";
const USER_KEY = "toaiapi_user";

function emitAuthSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SYNC_EVENT));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
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
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  emitAuthSync();
}

export function clearAuthData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitAuthSync();
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

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message || `API Error ${res.status}`)
        : typeof payload === "string" && payload
          ? payload
          : `API Error ${res.status}`;
    throw new Error(message);
  }

  // 后端返回格式: { code, message, data }
  if (payload && typeof payload === "object" && "code" in payload && "data" in payload) {
    if ((payload as { code: number | string }).code !== 0) {
      throw new Error(String((payload as { message?: unknown }).message || "API Error"));
    }
    return (payload as { data: T }).data;
  }

  return payload as T;
}

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>(`${API_PREFIX}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setAuthData(data);
  return data;
}

/**
 * 管理员登录
 */
export async function adminLogin(payload: LoginPayload): Promise<AuthResponse> {
  const data = await login(payload);

  const adminRoles = ["admin", "super_admin"];
  if (!adminRoles.includes(data.user.role.toLowerCase())) {
    clearAuthData();
    throw new Error("权限不足：仅管理员可访问后台");
  }

  return data;
}

/**
 * 用户注册
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const body = { ...payload };
  const captchaVerifyParam = body.captchaVerifyParam;
  delete body.captchaVerifyParam;
  delete body.captchaToken;

  const data = await authFetch<AuthResponse>(`${API_PREFIX}/auth/register`, {
    method: "POST",
    headers: captchaVerifyParam ? { "captcha-verify-param": captchaVerifyParam } : undefined,
    body: JSON.stringify(body),
  });

  setAuthData(data);
  return data;
}


/**
 * 发送邮箱验证码
 */
export async function sendVerificationCode(payload: SendVerificationCodePayload): Promise<{ message: string }> {
  const body = { email: payload.email, purpose: payload.purpose || "注册" };
  return authFetch<{ message: string }>(`${API_PREFIX}/auth/send-verification-code`, {
    method: "POST",
    headers: payload.captchaVerifyParam ? { "captcha-verify-param": payload.captchaVerifyParam } : undefined,
    body: JSON.stringify(body),
  });
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
  const data = await authFetch<TokenResponse>(`${API_PREFIX}/auth/refresh`, {
    method: "POST",
  });

  localStorage.setItem(TOKEN_KEY, data.accessToken);
  emitAuthSync();

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
