"use client";

/**
 * AdminShell - 管理后台共享布局
 *
 * 提供统一的侧边栏、头部、页脚。
 * 侧边栏根据当前路径自动高亮。
 */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  ToAiAPILogo,
  IconMenu,
  IconSearch,
  IconBell,
  IconSettings,
  IconChevronDown,
  IconDashboard,
  IconUserList,
  IconUserGroup,
  IconKey,
  IconOrders,
  IconRecharge,
  IconBill,
  IconInvoice,
  IconModel,
  IconChannel,
  IconPrice,
  IconSystem,
  IconLog,
  IconMonitor,
  IconBack,
} from "@/components/PixelIcons";

/* ============== 侧边栏导航数据 ============== */

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "控制台",
    items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin" }],
  },
  {
    title: "用户管理",
    items: [
      { icon: <IconUserList size={18} />, label: "用户列表", href: "/admin/users" },
      { icon: <IconUserGroup size={18} />, label: "用户分组", href: "/admin/users/groups" },
      { icon: <IconKey size={18} />, label: "API Key 管理", href: "/admin/apikeys" },
    ],
  },
  {
    title: "权限管理",
    items: [
      { icon: <IconUserGroup size={18} />, label: "角色管理", href: "/admin/roles" },
    ],
  },
  {
    title: "订单与财务",
    items: [
      { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders" },
      { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges" },
      { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
      { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices" },
    ],
  },
  {
    title: "模型与通道",
    items: [
      { icon: <IconModel size={18} />, label: "模型管理", href: "/admin/models" },
      { icon: <IconChannel size={18} />, label: "通道管理", href: "/admin/channels" },
      { icon: <IconPrice size={18} />, label: "模型价格", href: "/admin/pricing" },
    ],
  },
  {
    title: "系统与监控",
    items: [
      { icon: <IconSystem size={18} />, label: "系统设置", href: "/admin/settings" },
      { icon: <IconLog size={18} />, label: "操作日志", href: "/admin/logs/operations" },
      { icon: <IconLog size={18} />, label: "调用日志", href: "/admin/logs/requests" },
      { icon: <IconMonitor size={18} />, label: "系统监控", href: "/admin/monitor" },
    ],
  },
];

/* ============== 判断菜单是否激活 ============== */

function isActive(href: string, pathname: string): boolean {
  // 精确匹配 /admin
  if (href === "/admin") return pathname === "/admin";
  // 前缀匹配其他路径
  return pathname.startsWith(href);
}

/* ============== AdminShell 组件 ============== */

interface AdminShellProps {
  children: React.ReactNode;
  /** 页面标题，显示在头部 */
  title?: string;
}

export function AdminShell({ children, title }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  // 从 sidebarSections 自动推断页面标题
  const autoTitle = React.useMemo(() => {
    if (title) return title;
    for (const section of sidebarSections) {
      for (const item of section.items) {
        if (isActive(item.href, pathname)) return item.label;
      }
    }
    return "管理后台";
  }, [title, pathname]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 flex">
      {/* ============== 左侧导航 ============== */}
      <aside
        className={`bg-white border-r border-gray-100 flex flex-col flex-shrink-0 transition-all duration-200 ${
          sidebarCollapsed ? "w-[64px]" : "w-[220px]"
        }`}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <ToAiAPILogo size={28} />
          {!sidebarCollapsed && (
            <span className="ml-2 text-[16px] font-bold text-gray-900 whitespace-nowrap">
              ToAi<span className="text-primary">API</span>
            </span>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-3">
              {!sidebarCollapsed && (
                <div className="px-5 py-1.5 text-[11px] text-gray-400 font-medium">
                  {section.title}
                </div>
              )}
              <ul>
                {section.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition ${
                          active
                            ? "bg-primary-50 text-primary border-r-2 border-primary font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <span className={active ? "text-primary" : "text-gray-500"}>
                          {item.icon}
                        </span>
                        {!sidebarCollapsed && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 底部按钮 */}
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 text-[13px] text-gray-600 border border-gray-200 rounded hover:border-primary hover:text-primary transition"
          >
            <IconBack size={14} />
            {!sidebarCollapsed && "返回前台"}
          </Link>
        </div>
      </aside>

      {/* ============== 主内容区 ============== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0">
          <button
            className="mr-4 text-gray-500 hover:text-primary"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <IconMenu size={20} />
          </button>
          <h1 className="text-[16px] font-medium text-gray-900 mr-auto">{autoTitle}</h1>
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-primary">
              <IconSearch size={18} />
            </button>
            <button className="relative text-gray-500 hover:text-primary">
              <IconBell size={18} />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full px-1 min-w-[14px] text-center">
                0
              </span>
            </button>
            <Link href="/admin/settings" className="text-gray-500 hover:text-primary">
              <IconSettings size={18} />
            </Link>
            <div className="relative pl-5 border-l border-gray-100">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-[11px] font-bold">
                  {initial}
                </div>
                <div className="text-left">
                  <div className="text-[12.5px] font-medium text-gray-900 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {user?.role === "super_admin" ? "超级管理员" : "管理员"}
                  </div>
                </div>
                <IconChevronDown size={12} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* 页脚 */}
        <footer className="h-12 bg-white border-t border-gray-100 px-6 flex items-center justify-between text-[12px] text-gray-400 flex-shrink-0">
          <span>© 2026 ToAiAPI. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-primary">
              文档中心
            </a>
            <a href="#" className="hover:text-primary">
              帮助中心
            </a>
            <span className="text-gray-300">v0.5.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
