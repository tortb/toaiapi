"use client";

/**
 * 发票管理页（Admin）
 *
 * /admin/invoices — 占位页面，待后端 Invoice 模型实现后接入真实数据
 */

import * as React from "react";
import { useRouter } from "next/navigation";
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
  IconUsers,
} from "@/components/PixelIcons";

/* ============== 侧边栏 ============== */
interface SidebarItem { icon: React.ReactNode; label: string; href: string; active?: boolean; }
interface SidebarSection { title: string; items: SidebarItem[]; }

const sidebarSections: SidebarSection[] = [
  { title: "控制台", items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin" }] },
  { title: "用户管理", items: [
    { icon: <IconUserList size={18} />, label: "用户列表", href: "/admin/users" },
    { icon: <IconUserGroup size={18} />, label: "用户分组", href: "/admin/users/groups" },
    { icon: <IconKey size={18} />, label: "API Key 管理", href: "/admin/apikeys" },
  ]},
  { title: "权限管理", items: [{ icon: <IconUserGroup size={18} />, label: "角色管理", href: "/admin/roles" }] },
  { title: "订单与财务", items: [
    { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders" },
    { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges" },
    { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
    { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices", active: true },
    { icon: <IconRecharge size={18} />, label: "赠送活动", href: "/admin/promotions" },
  ]},
  { title: "模型与通道", items: [
    { icon: <IconModel size={18} />, label: "模型管理", href: "/admin/models" },
    { icon: <IconChannel size={18} />, label: "通道管理", href: "/admin/channels" },
    { icon: <IconPrice size={18} />, label: "模型价格", href: "/admin/pricing" },
    { icon: <IconUsers size={18} />, label: "服务商管理", href: "/admin/providers" },
  ]},
  { title: "系统与监控", items: [
    { icon: <IconSystem size={18} />, label: "系统设置", href: "/admin/settings" },
    { icon: <IconLog size={18} />, label: "操作日志", href: "/admin/logs/operations" },
    { icon: <IconLog size={18} />, label: "调用日志", href: "/admin/logs/requests" },
    { icon: <IconMonitor size={18} />, label: "系统监控", href: "/admin/monitor" },
  ]},
];

/* ============== 主页面 ============== */
export default function InvoicesPage() {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 bottom-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <ToAiAPILogo size={28} /><span className="ml-2.5 text-[15px] font-semibold text-gray-800">ToAIAPI</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-2">
              <div className="px-5 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">{section.title}</div>
              {section.items.map((item) => (
                <a key={item.href} href={item.href} className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition-colors ${item.active ? "text-primary bg-primary-50 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  {item.icon}{item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 ml-[220px]">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden"><IconMenu size={20} className="text-gray-500" /></button>
            <h1 className="text-base font-semibold text-gray-800">发票管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg"><IconBell size={18} className="text-gray-400" /></button>
            <div className="relative ml-1">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">{initial}</div>
                <IconChevronDown size={14} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{displayName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">退出登录</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <IconInvoice size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-800 mb-2">发票管理</h2>
            <p className="text-sm text-gray-500 mb-4">
              发票功能正在开发中，敬请期待。
            </p>
            <p className="text-xs text-gray-400">
              后续版本将支持：发票申请、审核、开具、下载等功能。
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
