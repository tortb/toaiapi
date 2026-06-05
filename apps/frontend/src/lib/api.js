const CONFIG_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";
const API_PREFIX = "/api/v1";
function buildUrl(path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const fullPath = `${API_PREFIX}${cleanPath}`;
    // 优先使用环境变量配置的 API 地址
    if (CONFIG_BASE && CONFIG_BASE.length > 0) {
        return `${CONFIG_BASE.replace(/\/$/, "")}${fullPath}`;
    }
    // 浏览器环境：使用当前域名的不同端口（后端默认 3001）
    if (typeof window !== "undefined") {
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:3001${fullPath}`;
    }
    // 服务端环境：尝试常见平台环境变量
    const host = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_HOST;
    if (host) {
        const prefix = host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host.replace(/\/$/, "")}`;
        return `${prefix}${fullPath}`;
    }
    // 开发环境回退
    return `http://localhost:3001${fullPath}`;
}
async function fetchJSON(path, init) {
    const url = buildUrl(path);
    const res = await fetch(url, {
        method: init?.method ?? "GET",
        headers: { "Content-Type": "application/json", ...init?.headers },
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
        return json.data;
    }
    return json;
}
export async function getPublicModels() {
    const result = await fetchJSON("/models/public");
    // API 返回 { data: [...] } 格式
    if (result && typeof result === "object" && "data" in result) {
        return result.data;
    }
    return result;
}
export async function getStatus() {
    const result = await fetchJSON("/status");
    // API 返回 { data: [...] } 格式
    if (result && typeof result === "object" && "data" in result) {
        return result.data;
    }
    return result;
}
//# sourceMappingURL=api.js.map