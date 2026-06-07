/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🚀 性能优化核心配置
  // Next.js 16默认启用SWC，无需swcMinify配置

  // ⚡ 恢复多核编译（Next.js 16已稳定）
  // 移除了 workerThreads: false 和 cpus: 1 限制

  // 🎯 按需加载图标库（减少打包体积80%+）
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // 📦 Turbopack配置（Next.js 16默认使用）
  turbopack: {
    // 空配置即可，使用默认优化
  },

  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    return [
      {
        source: "/api/:path*",
        destination: `${backend.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/overview",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
