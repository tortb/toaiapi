'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/services/api';
import {
  LayoutDashboard,
  Server,
  Radio,
  Cpu,
  Users,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/providers', label: 'Provider', icon: Server },
  { href: '/channels', label: '渠道', icon: Radio },
  { href: '/models', label: '模型', icon: Cpu },
  { href: '/users', label: '用户', icon: Users },
] as const;

/** Admin 管理后台布局 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // 忽略错误
    }
    localStorage.removeItem('admin-access-token');
    localStorage.removeItem('admin-refresh-token');
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const currentPage = NAV_ITEMS.find((item) => isActive(item.href));

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-6">
          <h1 className="text-lg font-bold text-foreground">ToAIAPI</h1>
          <span className="ml-2 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground">
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-border px-6">
          <h2 className="text-base font-semibold text-foreground">
            {currentPage?.label || '仪表盘'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
