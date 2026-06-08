import Link from "next/link";

export default function ForbiddenPage() {
  return <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6"><div className="max-w-md rounded-lg border border-[var(--line)] bg-white p-8 text-center"><h1 className="text-2xl font-bold text-[var(--foreground)]">403</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">当前账户没有访问该页面的权限。</p><Link href="/" className="mt-6 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">返回首页</Link></div></main>;
}
