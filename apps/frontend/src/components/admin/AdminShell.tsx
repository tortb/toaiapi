"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/Icons";
import { usePublicConfig } from "@/providers/public-config-provider";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  label: string;
  href: string;
  match?: string[];
}

interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

const navSections: AdminNavSection[] = [
  {
    title: "概览",
    items: [{ label: "控制台", href: "/admin" }],
  },
  {
    title: "账户",
    items: [
      { label: "用户列表", href: "/admin/users", match: ["/admin/users"] },
      { label: "用户分组", href: "/admin/users/groups" },
      { label: "API Key", href: "/admin/apikeys" },
      { label: "角色权限", href: "/admin/roles" },
    ],
  },
  {
    title: "模型",
    items: [
      { label: "模型管理", href: "/admin/models" },
      { label: "通道管理", href: "/admin/channels" },
      { label: "服务商", href: "/admin/providers" },
      { label: "价格策略", href: "/admin/pricing" },
    ],
  },
  {
    title: "财务",
    items: [
      { label: "订单", href: "/admin/orders" },
      { label: "充值记录", href: "/admin/recharges" },
      { label: "账单", href: "/admin/bills" },
      { label: "充值活动", href: "/admin/promotions" },
      { label: "发票", href: "/admin/invoices" },
      { label: "支付配置", href: "/admin/payment-configs" },
    ],
  },
  {
    title: "系统",
    items: [
      { label: "系统设置", href: "/admin/settings/basic", match: ["/admin/settings"] },
      { label: "验证码", href: "/admin/captcha" },
      { label: "短信", href: "/admin/sms" },
    ],
  },
];

function isActive(item: AdminNavItem, pathname: string) {
  if (item.href === "/admin") return pathname === "/admin";
  if (item.match?.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function initials(value: string) {
  return value.trim().slice(0, 1).toUpperCase() || "A";
}

export function AdminShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { config } = usePublicConfig();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const currentTitle = React.useMemo(() => {
    if (title) return title;
    for (const section of navSections) {
      const item = section.items.find((entry) => isActive(entry, pathname));
      if (item) return item.label;
    }
    return "管理后台";
  }, [pathname, title]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-neutral-950 text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/admin" className="min-w-0">
          <div className="text-md font-semibold tracking-tight">{config.site_name || "ToAIAPI"}</div>
          <div className="mt-0.5 text-xs text-white/45">Admin Console</div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">{section.title}</div>
            <div className="grid gap-1">
              {section.items.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ease-apple",
                      active ? "bg-white text-neutral-950" : "text-white/62 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-white/62 transition hover:border-white/20 hover:text-white" href="/">
          返回前台
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/30" aria-label="关闭导航" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-72 shadow-modal animate-slide-right">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-page/88 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>菜单</Button>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold tracking-tight text-neutral-950">{currentTitle}</div>
              <div className="hidden text-sm text-neutral-500 sm:block">{pathname}</div>
            </div>
            <div className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-400 shadow-[0_1px_1px_rgba(0,0,0,0.02)] md:flex">
              <SearchIcon size={15} />
              <span>搜索用户、订单、模型</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition hover:border-neutral-300"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-950 text-sm font-semibold text-white">{initials(displayName)}</span>
                <span className="hidden max-w-32 truncate text-sm font-medium text-neutral-800 sm:block">{displayName}</span>
              </button>
              {accountOpen && (
                <>
                  <button className="fixed inset-0 z-40" aria-label="关闭账户菜单" onClick={() => setAccountOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-popover animate-scale-in">
                    <div className="border-b border-neutral-100 px-3 py-2">
                      <div className="text-sm font-medium text-neutral-950">{displayName}</div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500">{user?.email}</div>
                    </div>
                    <button onClick={handleLogout} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-error transition hover:bg-error-bg">
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px] animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
