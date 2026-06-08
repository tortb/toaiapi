"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Banknote, Bell, FileText, Gift, Key, LayoutDashboard, LogOut, Settings, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";

interface SidebarItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const navItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "概览", href: "/dashboard/overview" },
  { icon: Key, label: "API 密钥", href: "/dashboard/apikeys" },
  { icon: BarChart3, label: "用量信息", href: "/dashboard/usage" },
  { icon: Wallet, label: "账单中心", href: "/dashboard/billing" },
  { icon: Banknote, label: "充值中心", href: "/dashboard/recharge" },
  { icon: Gift, label: "邀请奖励", href: "/dashboard/invite" },
  { icon: Settings, label: "个人设置", href: "/dashboard/settings" },
  { icon: Bell, label: "通知设置", href: "/dashboard/settings/notifications" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const displayName = user?.displayName || user?.email || "用户";

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="hidden lg:flex w-[260px] min-h-screen bg-[var(--surface-soft)] border-r border-[var(--line)] flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--line)]">
        <span className="text-xl text-[var(--accent)]">◆</span>
        <span className="text-base font-bold text-[var(--foreground)]">ToAIAPI</span>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--line)] bg-[var(--surface-hover)]">
        <Avatar name={displayName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--foreground)] truncate">{displayName}</div>
          <div className="text-xs text-[var(--text-muted)]">{user?.role || "USER"}</div>
        </div>
      </div>

      <div className="px-3 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">导航菜单</div>

      <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-[var(--line)] pt-3 space-y-0.5">
        <Link href="/docs" className="sidebar-item"><FileText className="w-4 h-4" /><span>API 文档</span></Link>
        <button onClick={handleLogout} className="sidebar-item w-full text-left"><LogOut className="w-4 h-4" /><span>退出登录</span></button>
      </div>
    </aside>
  );
}
