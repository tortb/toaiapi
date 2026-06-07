"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SETTINGS_CATEGORIES } from "@/components/admin/settings/settings-schema";
import { cn } from "@/lib/utils";

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminShell title="系统设置">
      <div className="mx-auto flex w-full max-w-7xl gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-0 rounded-xl border border-neutral-200 bg-white p-2 shadow-card">
            <div className="px-3 pb-2 pt-2">
              <div className="text-sm font-semibold text-neutral-950">系统设置</div>
              <div className="mt-1 text-sm text-neutral-500">按配置域拆分管理</div>
            </div>
            <nav className="mt-2 grid gap-1">
              {SETTINGS_CATEGORIES.map((item) => {
                const href = `/admin/settings/${item.route}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "rounded-lg px-3 py-2.5 transition duration-150 ease-apple",
                      active ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                    )}
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className={cn("mt-0.5 truncate text-xs", active ? "text-white/65" : "text-neutral-400")}>{item.description}</div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 overflow-x-auto lg:hidden">
            <div className="flex gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-card">
              {SETTINGS_CATEGORIES.map((item) => {
                const href = `/admin/settings/${item.route}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                      active ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {children}
        </div>
      </div>
    </AdminShell>
  );
}
