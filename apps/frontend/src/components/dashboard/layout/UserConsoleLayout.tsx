'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * UserConsoleLayout — 企业级仪表盘三栏布局
 *
 * ┌──────────┬────────────────────────────────┐
 * │ Sidebar  │  Topbar (sticky)               │
 * │ 220px    │  [标题]  [搜索]  [用户 ▼]      │
 * │          ├────────────────────────────────┤
 * │ 导航菜单 │  Content (flex-1, overflow)    │
 * │ 中文菜单 │                                 │
 * │          │                                 │
 * └──────────┴────────────────────────────────┘
 *
 * 响应式：
 *   ≥1024px：三栏完整布局
 *   <1024px：Sidebar 变成 Drawer（左侧滑出 + 遮罩 + 过渡动画）
 */

export default function UserConsoleLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-main flex">
      {/* ─── 桌面端 Sidebar（固定 220px） ─── */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* ─── 移动端 Sidebar Drawer（带动画） ─── */}
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* 抽屉面板 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* ─── 主内容区 ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
