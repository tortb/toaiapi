/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 优化内存：减少并发编译
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // 反向代理：将 /api/* 请求转发到后端，消除跨端口和 CORS 问题
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
