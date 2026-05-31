import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '登录 - ToAIAPI',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#030712]">
      {/* 网格背景 */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* 微弱光晕 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-white tracking-tight">ToAIAPI</h1>
          </Link>
          <p className="mt-2 text-sm text-white/30">企业级 AI Gateway 平台</p>
        </div>

        {/* 表单卡片 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
