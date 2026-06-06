"use client";

/**
 * 用户端页面共享布局
 *
 * 顶部导航栏 + 内容区域。
 * 仪表盘、账单、充值、API Keys、设置等页面共用。
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/bills", label: "账单" },
  { href: "/recharge", label: "充值" },
  { href: "/dashboard/apikeys", label: "API Keys" },
  { href: "/dashboard/settings", label: "设置" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              </div>
              <span className="text-sm font-bold text-gray-900">ToAiAPI</span>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    isActive(item.href)
                      ? "font-medium text-primary bg-primary/5"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-500 hover:text-red-500 transition"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
