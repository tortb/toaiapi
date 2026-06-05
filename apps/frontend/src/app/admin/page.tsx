"use client";

/**
 * Admin Dashboard
 *
 * 接入真实后端数据，展示系统概览、调用统计、模型分布等。
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDashboard,
  formatAmount,
  formatNumber,
  formatDate,
  getOrderStatusLabel,
  getChannelStatusLabel,
  type DashboardData,
} from "@/lib/admin-api";
import {
  ToAiAPILogo,
  IconMenu,
  IconSearch,
  IconBell,
  IconSettings,
  IconChevronDown,
  IconCalendar,
  IconRefresh,
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
  IconUsers,
  IconWallet,
  IconChartBar,
  IconChartLine,
  IconCoin,
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
    items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin", active: true }],
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

/* ============== 圆环图颜色 ============== */
const CHART_COLORS = ["#2962FF", "#FF9800", "#4CAF50", "#9C27B0", "#03A9F4"];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  // 加载 Dashboard 数据
  const fetchDashboard = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
          <h1 className="text-[16px] font-medium text-gray-900 mr-auto">控制台</h1>
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

        {/* 内容滚动区 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchDashboard} className="text-sm text-primary hover:underline">
                重试
              </button>
            </div>
          )}

          {/* 欢迎语 + 刷新按钮 */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900">
                欢迎回来, {displayName} 👋
              </h2>
              <p className="text-[12.5px] text-gray-500 mt-1">
                这是您系统的整体运行状况概览
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboard}
                disabled={isLoading}
                className="bg-primary text-white px-4 py-2 rounded text-[12.5px] font-medium flex items-center gap-1.5 hover:bg-primary-600 disabled:opacity-50"
              >
                <IconRefresh size={12} className={isLoading ? "animate-spin" : ""} />
                刷新
              </button>
            </div>
          </div>

          {/* 五个数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : dashboard ? (
              <>
                <MetricCard
                  icon={<IconUsers size={20} className="text-primary" />}
                  iconBg="bg-primary-50"
                  label="注册用户"
                  value={formatNumber(dashboard.metrics.totalUsers)}
                  growth={`${dashboard.metrics.totalUsersGrowth > 0 ? "+" : ""}${dashboard.metrics.totalUsersGrowth}%`}
                  positive={dashboard.metrics.totalUsersGrowth >= 0}
                  sub="较上期增长"
                />
                <MetricCard
                  icon={<IconWallet size={20} className="text-purple" />}
                  iconBg="bg-[#F3E5F5]"
                  label="总充值金额"
                  value={`¥ ${formatAmount(dashboard.metrics.totalRecharge)}`}
                  growth={`${dashboard.metrics.totalRechargeGrowth > 0 ? "+" : ""}${dashboard.metrics.totalRechargeGrowth}%`}
                  positive={dashboard.metrics.totalRechargeGrowth >= 0}
                  sub="较上期增长"
                />
                <MetricCard
                  icon={<IconChartBar size={20} className="text-info" />}
                  iconBg="bg-[#E1F5FE]"
                  label="总消费金额"
                  value={`¥ ${formatAmount(dashboard.metrics.totalConsumption)}`}
                  growth={`${dashboard.metrics.totalConsumptionGrowth > 0 ? "+" : ""}${dashboard.metrics.totalConsumptionGrowth}%`}
                  positive={dashboard.metrics.totalConsumptionGrowth >= 0}
                  sub="较上期增长"
                />
                <MetricCard
                  icon={<IconChartLine size={20} className="text-orange" />}
                  iconBg="bg-[#FFF3E0]"
                  label="总调用次数"
                  value={formatNumber(dashboard.metrics.totalRequests)}
                  growth={`${dashboard.metrics.totalRequestsGrowth > 0 ? "+" : ""}${dashboard.metrics.totalRequestsGrowth}%`}
                  positive={dashboard.metrics.totalRequestsGrowth >= 0}
                  sub="较上期增长"
                />
                <MetricCard
                  icon={<IconCoin size={20} className="text-success" />}
                  iconBg="bg-[#E8F5E9]"
                  label="总余额"
                  value={`¥ ${formatAmount(dashboard.metrics.totalBalance)}`}
                  growth=""
                  positive
                  sub="用户总余额"
                />
              </>
            ) : null}
          </div>

          {/* 折线图 + 圆环图 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
            {/* 折线图 */}
            <div className="lg:col-span-8 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">调用统计</h3>
                <span className="text-[12px] text-gray-500">最近 7 天</span>
              </div>
              {isLoading ? (
                <div className="h-[240px] bg-gray-50 rounded animate-pulse" />
              ) : dashboard?.callStats ? (
                <LineChart data={dashboard.callStats} />
              ) : (
                <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
                  暂无数据
                </div>
              )}
            </div>

            {/* 圆环图 */}
            <div className="lg:col-span-4 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">模型调用分布</h3>
              </div>
              {isLoading ? (
                <div className="h-[240px] bg-gray-50 rounded animate-pulse" />
              ) : dashboard?.modelDistribution && dashboard.modelDistribution.length > 0 ? (
                <DonutChart data={dashboard.modelDistribution} />
              ) : (
                <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
                  暂无数据
                </div>
              )}
            </div>
          </div>

          {/* 两个表格:订单 / 渠道 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
            {/* 最近订单 */}
            <div className="lg:col-span-8 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">最近订单</h3>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
                  ))}
                </div>
              ) : dashboard?.recentOrders && dashboard.recentOrders.length > 0 ? (
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-gray-500 text-left">
                      <th className="font-normal pb-3">订单号</th>
                      <th className="font-normal pb-3">用户</th>
                      <th className="font-normal pb-3 text-right">金额</th>
                      <th className="font-normal pb-3">支付方式</th>
                      <th className="font-normal pb-3">状态</th>
                      <th className="font-normal pb-3 text-right">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.map((o) => {
                      const statusInfo = getOrderStatusLabel(o.status);
                      return (
                        <tr key={o.id} className="border-t border-gray-50">
                          <td className="py-2.5 text-gray-900 font-mono text-[11.5px]">
                            {o.orderNo}
                          </td>
                          <td className="py-2.5 text-gray-600">{o.userEmail}</td>
                          <td className="py-2.5 text-right font-medium text-gray-900">
                            ¥ {formatAmount(o.amount)}
                          </td>
                          <td className="py-2.5 text-gray-600">{o.paymentMethod || "-"}</td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center gap-1 ${statusInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.color === "text-success" ? "bg-success" : statusInfo.color === "text-warning" ? "bg-warning" : "bg-gray-400"}`} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-gray-500 text-[11.5px]">
                            {formatDate(o.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">暂无订单</div>
              )}
            </div>

            {/* 渠道状态 */}
            <div className="lg:col-span-4 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">渠道状态</h3>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
                  ))}
                </div>
              ) : dashboard?.channelStatus && dashboard.channelStatus.length > 0 ? (
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-gray-500 text-left">
                      <th className="font-normal pb-3">渠道</th>
                      <th className="font-normal pb-3">状态</th>
                      <th className="font-normal pb-3 text-right">今日调用</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.channelStatus.map((c) => {
                      const statusInfo = getChannelStatusLabel(c.status);
                      return (
                        <tr key={c.id} className="border-t border-gray-50">
                          <td className="py-2.5 text-gray-900">{c.name}</td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center gap-1 ${statusInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.color === "text-success" ? "bg-success" : statusInfo.color === "text-warning" ? "bg-warning" : "bg-gray-400"}`} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-gray-900 font-mono text-[11.5px]">
                            {formatNumber(c.todayRequests)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">暂无渠道</div>
              )}
            </div>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="h-12 bg-white border-t border-gray-100 px-6 flex items-center justify-between text-[12px] text-gray-400 flex-shrink-0">
          <span>© 2026 ToAiAPI. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-primary">文档中心</a>
            <a href="#" className="hover:text-primary">帮助中心</a>
            <span className="text-gray-300">v0.5.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============== 骨架屏 ============== */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" />
        <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="w-24 h-6 bg-gray-100 rounded animate-pulse mb-2" />
      <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

/* ============== 指标卡片 ============== */
function MetricCard({
  icon,
  iconBg,
  label,
  value,
  growth,
  positive,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  growth: string;
  positive: boolean;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${iconBg} rounded flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[12.5px] text-gray-500">{label}</span>
      </div>
      <div className="text-[20px] font-bold text-gray-900 leading-tight mb-2">
        {value}
      </div>
      {growth && (
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={positive ? "text-success" : "text-red-500"}>{growth}</span>
          <span className="text-gray-400">{sub}</span>
        </div>
      )}
      {!growth && (
        <div className="text-[11px] text-gray-400">{sub}</div>
      )}
    </div>
  );
}

/* ============== 折线图 ============== */
function LineChart({ data }: { data: Array<{ label: string; requests: number }> }) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.requests);
  const max = Math.max(...values, 1);
  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const stepX = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (d.requests / max) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y 轴刻度
  const ySteps = 4;
  const yValues = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((max / ySteps) * i));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px]">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2962FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2962FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 网格线 */}
        {yValues.map((v, i) => {
          const y = padding.top + chartH - (v / max) * chartH;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F0F4F8" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 3} fontSize="10" fill="#8A9BA8" textAnchor="end">
                {formatNumber(v)}
              </text>
            </g>
          );
        })}

        {/* X 轴标签 */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 7) !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={padding.left + i * stepX} y={height - 8} fontSize="10" fill="#8A9BA8" textAnchor="middle">
              {d.label}
            </text>
          );
        })}

        {/* 面积 */}
        <path d={areaPath} fill="url(#lineGrad)" />

        {/* 折线 */}
        <path d={linePath} fill="none" stroke="#2962FF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* 数据点 */}
        {points.map((p, i) => (
          <rect key={i} x={p.x - 2} y={p.y - 2} width="4" height="4" fill="#fff" stroke="#2962FF" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}

/* ============== 圆环图 ============== */
function DonutChart({ data }: { data: Array<{ name: string; percentage: number }> }) {
  const size = 130;
  const radius = 50;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div>
      <div className="flex items-center justify-center mb-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            {data.map((d, i) => {
              const dash = (d.percentage / 100) * circumference;
              const gap = circumference - dash;
              const seg = (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return seg;
            })}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#F0F4F8" strokeWidth={strokeWidth} opacity="0.4" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10.5px] text-gray-500">总计</div>
            <div className="text-[13px] font-bold text-gray-900">100%</div>
          </div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-gray-700 flex-1 truncate">{d.name}</span>
            <span className="text-gray-500 font-mono">{d.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
