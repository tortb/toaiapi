/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 优化内存：减少并发编译
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
