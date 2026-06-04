'use client';

import { useEffect, useState } from 'react';
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
  CreditCard,
  Mail,
  Receipt,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/providers', label: 'Provider', icon: Server },
  { href: '/channels', label: '渠道', icon: Radio },
  { href: '/models', label: '模型', icon: Cpu },
  { href: '/users', label: '用户', icon: Users },
  { href: '/payment-config', label: '支付配置', icon: CreditCard },
  { href: '/smtp-config', label: '邮件配置', icon: Mail },
  { href: '/orders', label: '订单管理', icon: Receipt },
] as const;

/**
 * Admin 管理后台布局
 *
 * 左侧固定侧边栏（移动端可折叠）+ 顶部标题栏 + 主内容区
 * SECURITY: 未认证时重定向到登录页
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 切换路由时关闭移动端侧边栏
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // 认证检查中 — 显示加载骨架屏
  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

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
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
            <span className="text-xs font-bold text-primary">T</span>
          </div>
          <h1 className="text-base font-bold tracking-tight text-foreground">ToAIAPI</h1>
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            Admin
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 用户信息 + 退出 */}
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2 px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
              <span className="text-xs font-medium text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{user.email}</p>
              <p className="text-[10px] text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-border px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">
            {currentPage?.label || '仪表盘'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
