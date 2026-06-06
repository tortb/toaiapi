/**
 * 统一 API URL 构建工具
 *
 * - 客户端（浏览器）：返回相对路径，通过 Next.js rewrites 代理到后端
 * - 服务端（SSR）：返回完整 URL，直连后端
 *
 * 这样做的好处：
 * 1. 消除跨端口 CORS 问题
 * 2. 不再硬编码端口号
 * 3. 部署时只需配置 NEXT_PUBLIC_API_URL 环境变量
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * 构建 API 请求 URL
 * @param path API 路径，如 "/api/v1/auth/login" 或 "/api/v1/public-config"
 */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 如果显式配置了 API 地址，直接使用
  if (API_BASE && API_BASE.length > 0) {
    return `${API_BASE.replace(/\/$/, "")}${cleanPath}`;
  }

  // 客户端：使用相对路径，通过 Next.js rewrites 代理
  if (typeof window !== "undefined") {
    return cleanPath;
  }

  // 服务端（SSR）：直连后端
  return `http://localhost:3001${cleanPath}`;
}
