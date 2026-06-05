"use client";

/**
 * 充值记录页（Admin）
 *
 * /admin/recharges — 查看所有充值订单
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOrders,
  formatAmount,
  formatDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  type OrderAdminData,
} from "@/lib/admin-api";
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
    { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges", active: true },
    { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
    { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices" },
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
export default function RechargesPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [orders, setOrders] = React.useState<OrderAdminData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  React.useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getOrders({ page, pageSize: 20, search: search || undefined, status: filterStatus || undefined });
      setOrders(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterStatus]);

  React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

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
            <h1 className="text-base font-semibold text-gray-800">充值记录</h1>
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
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-72">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="搜索订单号/用户..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">全部状态</option>
                <option value="PENDING">待支付</option>
                <option value="PAID">已支付</option>
                <option value="FAILED">支付失败</option>
                <option value="CANCELLED">已取消</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchOrders} className="text-sm text-primary hover:underline">重试</button>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="font-normal text-left px-4 py-3 text-[13px]">订单号</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">用户</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">支付方式</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">支付时间</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">加载中...</p></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">暂无数据</td></tr>
                ) : orders.map((o) => {
                  const s = getOrderStatusLabel(o.status);
                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{o.orderNo}</td>
                      <td className="px-4 py-3 text-[13px]">
                        <div className="text-gray-800">{o.userName || "-"}</div>
                        <div className="text-xs text-gray-400">{o.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-right text-gray-800 font-mono">¥{formatAmount(o.amount)}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-600">{getPaymentMethodLabel(o.paymentMethod)}</td>
                      <td className="px-4 py-3 text-[13px]">
                        <span className={`inline-flex items-center gap-1.5 ${s.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />{s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{o.paidAt ? formatDate(o.paidAt) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>共 {total} 条，第 {page}/{totalPages} 页</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">上一页</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">下一页</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
