'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/services/api';

/**
 * 仪表盘布局
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // 忽略错误
    }
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">ToAIAPI</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="ml-3">仪表盘</span>
          </Link>
          <Link
            href="/api-keys"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="ml-3">API Keys</span>
          </Link>
          <Link
            href="/usage"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="ml-3">使用记录</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="ml-3">设置</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1">
        {/* 顶部导航 */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">仪表盘</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                退出
              </button>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
