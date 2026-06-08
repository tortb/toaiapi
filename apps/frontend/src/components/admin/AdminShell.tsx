"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Building2, Cable, ClipboardList, FileText, Key, LayoutDashboard, LogOut, MessageSquare, PartyPopper, Receipt, Settings, Users, UsersRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const groups: [string, [typeof LayoutDashboard, string, string][]][] = [
  ["概览", [[LayoutDashboard, "控制台", "/admin"]]],
  ["账户", [[Users, "用户管理", "/admin/users"], [UsersRound, "用户分组", "/admin/users/groups"], [Key, "API Key", "/admin/apikeys"]]],
  ["模型", [[Bot, "模型管理", "/admin/models"], [Cable, "通道管理", "/admin/channels"], [Building2, "服务商", "/admin/providers"]]],
  ["财务", [[ClipboardList, "订单", "/admin/orders"], [FileText, "账单", "/admin/bills"], [PartyPopper, "充值活动", "/admin/promotions"], [Receipt, "发票", "/admin/invoices"], [Settings, "支付配置", "/admin/payment-configs"]]],
  ["系统", [[Settings, "系统设置", "/admin/settings"], [MessageSquare, "短信", "/admin/sms"]]],
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-[260px] min-h-screen bg-[var(--surface-soft)] border-r border-[var(--line)] flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--line)]">
          <span className="text-xl text-[var(--accent)]">◆</span>
          <span className="text-base font-bold text-[var(--foreground)]">ToAIAPI Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {groups.map(([title, items]) => (
            <div key={title}>
              <div className="px-3 mb-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</div>
              {items.map(([Icon, label, href]) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-sm mb-0.5 transition-colors ${active ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="px-3 pb-4 border-t border-[var(--line)] pt-3">
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors w-full text-left">
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 bg-[#FAFAFA] p-8">{children}</main>
    </div>
  );
}
