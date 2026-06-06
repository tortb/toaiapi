'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconOverview,
  IconApiKey,
  IconUsage,
  IconBilling,
  IconLogs,
  IconSettings,
  IconBack,
} from '@/components/dashboard/ui/Icons';

/* ─── 菜单项（全部中文） ─── */

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <IconOverview size={18} />, label: '概览', href: '/dashboard/overview' },
  { icon: <IconApiKey size={18} />, label: 'API 密钥', href: '/dashboard/apikeys' },
  { icon: <IconUsage size={18} />, label: '使用统计', href: '/dashboard/usage' },
  { icon: <IconBilling size={18} />, label: '账单中心', href: '/dashboard/billing' },
  { icon: <IconLogs size={18} />, label: '请求日志', href: '/dashboard/logs' },
  { icon: <IconSettings size={18} />, label: '系统设置', href: '/dashboard/settings' },
];

/* ─── 判断激活 ─── */

function isActive(href: string, pathname: string): boolean {
  if (href === '/dashboard/overview') return pathname === '/dashboard' || pathname === '/dashboard/overview';
  return pathname.startsWith(href);
}

/* ─── Sidebar 组件 ─── */

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-200 ${
        collapsed ? 'w-[64px]' : 'w-[220px]'
      }`}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        {collapsed ? (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[16px] font-bold text-main">
              ToAI<span className="text-primary">API</span>
            </span>
          </Link>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 h-10 text-sm rounded-lg transition-all duration-150 ${
                    active
                      ? 'bg-soft text-main font-medium'
                      : 'text-secondary hover:bg-gray-50 hover:text-main'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {/* 激活指示蓝条 */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                  )}
                  <span className={active ? 'text-primary' : 'text-muted'}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部：返回前台 */}
      <div className="p-3 border-t border-gray-200">
        <Link
          href="/"
          className={`flex items-center justify-center gap-2 w-full h-9 text-sm text-secondary border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition ${
            collapsed ? 'px-0' : 'px-3'
          }`}
          title="返回前台"
        >
          <IconBack size={14} />
          {!collapsed && <span>返回前台</span>}
        </Link>
      </div>
    </aside>
  );
}
