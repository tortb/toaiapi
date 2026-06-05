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

  // 优先使用环境变量配置的 API 地址
  if (CONFIG_BASE && CONFIG_BASE.length > 0) {
    return `${CONFIG_BASE.replace(/\/$/, "")}${cleanPath}`;
  }

  // 浏览器环境：使用当前域名的不同端口（后端默认 3001）
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001${cleanPath}`;
  }

  // 服务端环境：尝试常见平台环境变量
  const host = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_HOST;
  if (host) {
    const prefix = host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host.replace(/\/$/, "")}`;
    return `${prefix}${cleanPath}`;
  }

  // 开发环境回退
  return `http://localhost:3001${cleanPath}`;
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
