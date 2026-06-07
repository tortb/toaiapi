/**
 * 后端 API 辅助工具
 *
 * 通过 Playwright request context 直接调用后端 API，
 * 用于测试前置数据准备和后置清理。
 */

import type { APIRequestContext, APIResponse } from "@playwright/test";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

/** 调用后端 API（自动解析 { code, message, data } 信封） */
async function apiCall<T = any>(
  request: APIRequestContext,
  method: string,
  path: string,
  options?: {
    body?: Record<string, any>;
    token?: string;
    headers?: Record<string, string>;
  },
): Promise<{ code: number; message: string; data: T }> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await request.fetch(url, {
    method,
    headers,
    data: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  return json;
}

/** 注册新用户并返回 token */
export async function registerUser(
  request: APIRequestContext,
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthTokens> {
  const res = await apiCall(request, "POST", "/api/v1/auth/register", {
    body: { email, password, displayName },
  });
  if (res.code !== 0) {
    throw new Error(`注册失败: ${res.message} (code=${res.code})`);
  }
  return {
    accessToken: res.data.tokens.accessToken,
    refreshToken: res.data.tokens.refreshToken,
    userId: res.data.user.id,
    email: res.data.user.email,
  };
}

/** 登录用户并返回 token */
export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const res = await apiCall(request, "POST", "/api/v1/auth/login", {
    body: { email, password },
  });
  if (res.code !== 0) {
    throw new Error(`登录失败: ${res.message} (code=${res.code})`);
  }
  return {
    accessToken: res.data.tokens.accessToken,
    refreshToken: res.data.tokens.refreshToken,
    userId: res.data.user.id,
    email: res.data.user.email,
  };
}

/** 创建 API Key */
export async function createApiKey(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<{ id: string; key: string; keyPrefix: string }> {
  const res = await apiCall(request, "POST", "/api/v1/api-keys", {
    body: { name },
    token,
  });
  if (res.code !== 0) {
    throw new Error(`创建 API Key 失败: ${res.message}`);
  }
  return { id: res.data.id, key: res.data.key, keyPrefix: res.data.keyPrefix };
}

/** 获取所有 API Key */
export async function getApiKeys(
  request: APIRequestContext,
  token: string,
): Promise<any[]> {
  const res = await apiCall(request, "GET", "/api/v1/api-keys", { token });
  if (res.code !== 0) throw new Error(`获取 API Key 列表失败: ${res.message}`);
  return res.data;
}

/** 删除 API Key */
export async function deleteApiKey(
  request: APIRequestContext,
  token: string,
  keyId: string,
): Promise<void> {
  await apiCall(request, "DELETE", `/api/v1/api-keys/${keyId}`, { token });
}

/** 禁用 API Key */
export async function disableApiKey(
  request: APIRequestContext,
  token: string,
  keyId: string,
): Promise<any> {
  const res = await apiCall(
    request,
    "PATCH",
    `/api/v1/api-keys/${keyId}/disable`,
    { token },
  );
  return res.data;
}

/** 启用 API Key */
export async function enableApiKey(
  request: APIRequestContext,
  token: string,
  keyId: string,
): Promise<any> {
  const res = await apiCall(
    request,
    "PATCH",
    `/api/v1/api-keys/${keyId}/enable`,
    { token },
  );
  return res.data;
}

/** 健康检查 */
export async function healthCheck(
  request: APIRequestContext,
): Promise<boolean> {
  try {
    const res = await apiCall(request, "GET", "/api/v1/health");
    return res.code === 0;
  } catch {
    return false;
  }
}

/** 管理员登录 */
export async function adminLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const res = await apiCall(request, "POST", "/api/v1/auth/login", {
    body: { email, password },
  });
  if (res.code !== 0) {
    throw new Error(`管理员登录失败: ${res.message} (code=${res.code})`);
  }
  return {
    accessToken: res.data.tokens.accessToken,
    refreshToken: res.data.tokens.refreshToken,
    userId: res.data.user.id,
    email: res.data.user.email,
  };
}

/**
 * 更新系统设置（单个）
 * 使用 PUT 批量接口，保留原有 type 不被覆盖为 string
 */
export async function updateSystemSetting(
  request: APIRequestContext,
  adminToken: string,
  category: string,
  key: string,
  value: string,
): Promise<void> {
  const res = await apiCall(
    request,
    "PUT",
    `/api/v1/admin/system-settings/${category}`,
    {
      body: { settings: [{ key, value }] },
      token: adminToken,
    },
  );
  if (res.code !== 0) {
    throw new Error(`更新设置 ${key} 失败: ${res.message}`);
  }
}

/** 获取系统设置 */
export async function getSystemSettings(
  request: APIRequestContext,
  adminToken: string,
  category?: string,
): Promise<any> {
  const path = category
    ? `/api/v1/admin/system-settings/${category}`
    : "/api/v1/admin/system-settings";
  const res = await apiCall(request, "GET", path, { token: adminToken });
  if (res.code !== 0) throw new Error(`获取设置失败: ${res.message}`);
  return res.data;
}

/** 调用 chat/completions 端点 */
export async function chatCompletion(
  request: APIRequestContext,
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  stream = false,
): Promise<any> {
  const url = `${API_BASE}/api/v1/chat/completions`;
  const res = await request.fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    data: JSON.stringify({ model, messages, stream }),
  });
  return res;
}
