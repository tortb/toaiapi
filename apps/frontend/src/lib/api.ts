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

const CONFIG_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";

function buildUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // If running in browser, relative path is fine
  if (typeof window !== "undefined") {
    return `${cleanPath}`;
  }

  // Server side: need absolute URL
  if (CONFIG_BASE && CONFIG_BASE.length > 0) {
    return `${CONFIG_BASE.replace(/\/$/, "")}${cleanPath}`;
  }

  // Try common platform env vars
  const host = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_HOST;
  if (host) {
    const prefix = host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host.replace(/\/$/, "")}`;
    return `${prefix}${cleanPath}`;
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3001${cleanPath}`;
  }

  throw new Error("Cannot build absolute URL for API fetch: set NEXT_PUBLIC_API_BASE in environment.");
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
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

  const data = await res.json().catch(() => null);
  return data as T;
}

export async function getPublicModels(): Promise<Model[]> {
  return fetchJSON<Model[]>("/v1/models/public");
}

export async function getStatus(): Promise<ChannelStatus[]> {
  return fetchJSON<ChannelStatus[]>("/v1/status");
}
