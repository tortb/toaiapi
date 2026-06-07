import { buildApiUrl } from "./http";
import type { ApiErrorPayload, PaginatedData, QueryParams, QueryValue } from "@/types/api";

const API_PREFIX = "/api/v1";
const ACCESS_TOKEN_KEY = "toaiapi_access_token";
const REFRESH_TOKEN_KEY = "toaiapi_refresh_token";

export class ApiError extends Error {
  status: number;
  code?: string | number;
  payload?: unknown;

  constructor(message: string, status: number, code?: string | number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  query?: QueryParams;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  auth?: boolean;
  redirectOnUnauthorized?: boolean;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

function clearTokens() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("toaiapi_user");
}

function appendQuery(path: string, query?: QueryParams) {
  if (!query) return path;
  const params = new URLSearchParams();

  const append = (key: string, value: QueryValue) => {
    if (value === null || value === undefined) return;
    params.append(key, String(value));
  };

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) append(key, item);
    } else {
      append(key, value);
    }
  }

  const search = params.toString();
  if (!search) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${search}`;
}

function withApiPrefix(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith(API_PREFIX)) return path;
  return `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

function isJsonBody(body: ApiRequestOptions["body"]): body is Record<string, unknown> | unknown[] {
  return Boolean(body) && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload;
    const message =
      typeof errorPayload === "object" && errorPayload?.message
        ? errorPayload.message
        : typeof payload === "string" && payload
          ? payload
          : `API Error ${response.status}`;
    throw new ApiError(message, response.status, errorPayload?.code, payload);
  }

  if (payload && typeof payload === "object" && "code" in payload && "data" in payload) {
    const wrapped = payload as { code: number | string; message?: string; data: T };
    if (wrapped.code !== 0) {
      throw new ApiError(wrapped.message || "API Error", response.status, wrapped.code, payload);
    }
    return wrapped.data;
  }

  return payload as T;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new ApiError("No refresh token available", 401);

      const response = await fetch(buildApiUrl(`${API_PREFIX}/auth/refresh`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });
      const tokens = await parseResponse<{ accessToken: string; refreshToken: string }>(response);
      setTokens(tokens);
      return tokens.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, body, auth = false, redirectOnUnauthorized = true, headers: inputHeaders, ...init } = options;
  const url = buildApiUrl(appendQuery(withApiPrefix(path), query));
  const headers = new Headers(inputHeaders);

  let requestBody: BodyInit | undefined;
  if (isJsonBody(body)) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  } else if (body) {
    requestBody = body as BodyInit;
  }

  if (auth) {
    const token = getAccessToken();
    if (!token) throw new ApiError("未登录", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  const makeRequest = () => fetch(url, {
    method: init.method || (body ? "POST" : "GET"),
    credentials: auth ? "include" : init.credentials,
    ...init,
    headers,
    body: requestBody,
  });

  let response = await makeRequest();
  if (auth && response.status === 401) {
    try {
      const token = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${token}`);
      response = await makeRequest();
    } catch (error) {
      clearTokens();
      if (redirectOnUnauthorized && isBrowser()) window.location.href = "/login";
      throw error;
    }
  }

  return parseResponse<T>(response);
}

function createApi(auth: boolean) {
  return {
    request: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, auth }),
    get: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, auth, method: "GET" }),
    post: <T>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) => request<T>(path, { ...options, auth, method: "POST", body }),
    put: <T>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) => request<T>(path, { ...options, auth, method: "PUT", body }),
    patch: <T>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) => request<T>(path, { ...options, auth, method: "PATCH", body }),
    delete: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, auth, method: "DELETE" }),
  };
}

export const publicApi = createApi(false);
export const authApi = createApi(true);
export const adminApi = createApi(true);

export function normalizePaginated<T>(raw: unknown, fallbackPage = 1, fallbackPageSize = 20): PaginatedData<T> {
  const value = raw as Partial<PaginatedData<T>> & { data?: T[] };
  const items = value.items ?? value.data ?? [];
  const total = value.total ?? items.length;
  const page = value.page ?? fallbackPage;
  const pageSize = value.pageSize ?? fallbackPageSize;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: value.totalPages ?? Math.max(1, Math.ceil(total / pageSize)),
  };
}
