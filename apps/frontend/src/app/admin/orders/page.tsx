"use client";

/**
 * 订单管理页面
 *
 * 展示所有订单，支持搜索、筛选、分页。
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOrders,
  formatDate,
  formatAmount,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  type OrderAdminData,
  type PaginatedResponse,
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
  IconBack,
} from "@/components/PixelIcons";

/* ============== 侧边栏导航数据 ============== */
interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
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
      { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders", active: true },
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

export default function OrdersPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [data, setData] = React.useState<PaginatedResponse<OrderAdminData> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 筛选状态
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  // 加载订单列表
  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOrders({
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 搜索防抖
  const [searchInput, setSearchInput] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 flex">
      {/* ============== 左侧导航 ============== */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <ToAiAPILogo size={28} />
          <span className="ml-2 text-[16px] font-bold text-gray-900">
            ToAi<span className="text-primary">API</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className="px-5 py-1.5 text-[11px] text-gray-400 font-medium">
                {section.title}
              </div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition ${
                        item.active
                          ? "bg-primary-50 text-primary border-r-2 border-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={item.active ? "text-primary" : "text-gray-500"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 text-[13px] text-gray-600 border border-gray-200 rounded hover:border-primary hover:text-primary transition"
          >
            <IconBack size={14} />
            返回前台
          </a>
        </div>
      </aside>

      {/* ============== 主内容区 ============== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0">
          <button className="mr-4 text-gray-500 hover:text-primary">
            <IconMenu size={20} />
          </button>
          <h1 className="text-[16px] font-medium text-gray-900 mr-auto">订单管理</h1>
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-primary">
              <IconSearch size={18} />
            </button>
            <button className="relative text-gray-500 hover:text-primary">
              <IconBell size={18} />
            </button>
            <button className="text-gray-500 hover:text-primary">
              <IconSettings size={18} />
            </button>
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
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        <main className="flex-1 overflow-y-auto p-6">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchOrders} className="text-sm text-primary hover:underline">
                重试
              </button>
            </div>
          )}

          {/* 筛选区 */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* 搜索框 */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="搜索订单号 / 产品名 / 用户邮箱..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* 状态筛选 */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">所有状态</option>
                <option value="PENDING">待支付</option>
                <option value="PAID">已支付</option>
                <option value="FAILED">支付失败</option>
                <option value="REFUNDED">已退款</option>
                <option value="CANCELLED">已取消</option>
              </select>

              {/* 刷新按钮 */}
              <button
                onClick={fetchOrders}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                刷新
              </button>
            </div>
          </div>

          {/* 订单表格 */}
          <div className="bg-white rounded-lg border border-gray-100">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">加载中...</p>
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500">
                        <th className="text-left font-normal px-4 py-3">订单号</th>
                        <th className="text-left font-normal px-4 py-3">用户</th>
                        <th className="text-left font-normal px-4 py-3">产品</th>
                        <th className="text-right font-normal px-4 py-3">金额</th>
                        <th className="text-left font-normal px-4 py-3">支付方式</th>
                        <th className="text-left font-normal px-4 py-3">状态</th>
                        <th className="text-left font-normal px-4 py-3">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((o) => {
                        const statusInfo = getOrderStatusLabel(o.status);
                        return (
                          <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-mono text-gray-900 text-[12px]">{o.orderNo}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900">{o.userEmail}</div>
                              {o.userName && (
                                <div className="text-[11px] text-gray-500">{o.userName}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900">{o.productName}</div>
                              <div className="text-[11px] text-gray-500">{o.productType}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-medium text-gray-900">¥ {formatAmount(o.amount)}</div>
                              {o.paidAmount && o.paidAmount !== o.amount && (
                                <div className="text-[11px] text-gray-500">
                                  实付: ¥ {formatAmount(o.paidAmount)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {getPaymentMethodLabel(o.paymentMethod)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-[12px]">
                              {formatDate(o.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {data.totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      共 {data.total} 条，第 {data.page}/{data.totalPages} 页
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                        disabled={page === data.totalPages}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">暂无订单数据</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
