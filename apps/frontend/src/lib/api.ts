import { buildApiUrl } from "./http";

export type Model = {
  id: string;
  name: string;
  vendor?: string;
  input_price?: number | null;
  output_price?: number | null;
  description?: string | null;
};

export type ChannelStatus = {
  name: string;
  healthy: boolean;
  message?: string | null;
  last_checked?: string | null;
};

const API_PREFIX = "/api/v1";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(`${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`);
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: { "Content-Type": "application/json", ...(init?.headers as any) },
    // 不携带用户凭证到公开页面的后端请求
    credentials: "omit",
    // 在服务端组件中使用 next.js 的 revalidate 支持（安全且可缓存）
    // @ts-ignore-next-line
    next: { revalidate: 60 },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetch ${url} failed: ${res.status} ${text}`);
  }

  const json = await res.json().catch(() => null);

  // 后端返回格式: { code, message, data }
  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) {
      throw new Error(json.message || "API Error");
    }
    return json.data as T;
  }

  return json as T;
}

export async function getPublicModels(): Promise<Model[]> {
  const result = await fetchJSON<{ data: Model[] }>("/models/public");
  // API 返回 { data: [...] } 格式
  if (result && typeof result === "object" && "data" in result) {
    return result.data;
  }
  return result as unknown as Model[];
}

export async function getStatus(): Promise<ChannelStatus[]> {
  const result = await fetchJSON<{ data: ChannelStatus[] }>("/status");
  // API 返回 { data: [...] } 格式
  if (result && typeof result === "object" && "data" in result) {
    return result.data;
  }
  return result as unknown as ChannelStatus[];
}
