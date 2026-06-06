'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  IconSearch,
  IconBell,
  IconChevronDown,
  IconMenu,
  IconLogout,
  IconSettings,
} from '@/components/dashboard/ui/Icons';

/* ─── 路由 → 中文标题映射 ─── */

const TITLE_MAP: Record<string, string> = {
  '/dashboard': '概览',
  '/dashboard/apikeys': 'API 密钥',
  '/dashboard/usage': '使用统计',
  '/bills': '账单中心',
  '/dashboard/logs': '请求日志',
  '/dashboard/settings': '系统设置',
};

function resolveTitle(pathname: string): string {
  // 精确匹配
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname];
  // 前缀匹配
  for (const [prefix, title] of Object.entries(TITLE_MAP)) {
    if (pathname.startsWith(prefix)) return title;
  }
  return '控制台';
}

/* ─── Topbar 组件 ─── */

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);

  const title = resolveTitle(pathname);
  const displayName = user?.displayName || user?.email?.split('@')[0] || '用户';
  const initial = displayName.charAt(0).toUpperCase();
  const userEmail = user?.email || '';

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30">
      {/* 左侧：汉堡菜单（移动端）+ 页面标题 */}
      <div className="flex items-center gap-3 mr-auto">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:bg-gray-100 transition"
          aria-label="展开菜单"
        >
          <IconMenu size={18} />
        </button>
        <h1 className="text-[16px] font-semibold text-main">{title}</h1>
      </div>

      {/* 中间：搜索框（桌面端） */}
      <div className="hidden md:flex items-center mx-4">
        <div
          className={`flex items-center gap-2 px-3.5 h-9 w-[240px] rounded-lg border transition-all duration-200 ${
            searchFocused
              ? 'border-primary bg-white shadow-[0_0_0_3px_rgba(41,98,255,0.1)]'
              : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
          }`}
        >
          <IconSearch size={15} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索 API / 日志..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-sm text-main placeholder:text-muted outline-none"
          />
        </div>
      </div>

      {/* 右侧：用户区域 */}
      <div className="flex items-center gap-4">
        {/* 通知 */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:bg-gray-100 transition">
          <IconBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[13px] font-bold">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[13px] font-medium text-main leading-tight">{displayName}</div>
              <div className="text-[11px] text-muted leading-tight truncate max-w-[120px]">
                {userEmail}
              </div>
            </div>
            <IconChevronDown size={14} className="text-muted hidden sm:block" />
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200 py-1.5 z-50">
                {/* 用户信息 */}
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-medium text-main">{displayName}</p>
                  <p className="text-xs text-muted">{userEmail}</p>
                </div>

                {/* 设置 */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-secondary hover:bg-gray-50 transition"
                >
                  <IconSettings size={15} />
                  系统设置
                </button>

                {/* 退出 */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-red-50 transition"
                >
                  <IconLogout size={15} />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
