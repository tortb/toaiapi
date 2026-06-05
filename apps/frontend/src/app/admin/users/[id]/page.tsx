"use client";

/**
 * 用户详情页
 *
 * /admin/users/[id]
 */

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getUser,
  formatAmount,
  formatDate,
  formatNumber,
  getRoleLabel,
  getUserStatusLabel,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  type UserDetailData,
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
  IconBack,
} from "@/components/PixelIcons";

/* ============== 侧边栏 ============== */
interface SidebarItem { icon: React.ReactNode; label: string; href: string; active?: boolean; }
interface SidebarSection { title: string; items: SidebarItem[]; }

const sidebarSections: SidebarSection[] = [
  { title: "控制台", items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin" }] },
  { title: "用户管理", items: [
    { icon: <IconUserList size={18} />, label: "用户列表", href: "/admin/users", active: true },
    { icon: <IconUserGroup size={18} />, label: "用户分组", href: "/admin/users/groups" },
    { icon: <IconKey size={18} />, label: "API Key 管理", href: "/admin/apikeys" },
  ]},
  { title: "权限管理", items: [{ icon: <IconUserGroup size={18} />, label: "角色管理", href: "/admin/roles" }] },
  { title: "订单与财务", items: [
    { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders" },
    { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges" },
    { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
    { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices" },
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

/* ============== 指标卡 ============== */
function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ============== 交易类型标签 ============== */
function TransactionTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    RECHARGE: { label: "充值", color: "text-success bg-success/10" },
    DEDUCT: { label: "消费", color: "text-red-600 bg-red-50" },
    GIFT: { label: "赠送", color: "text-orange bg-orange/10" },
    REFUND: { label: "退款", color: "text-info bg-info/10" },
    REWARD: { label: "奖励", color: "text-purple bg-purple/10" },
  };
  const t = map[type] ?? { label: type, color: "text-gray-600 bg-gray-100" };
  return <span className={`inline-block px-2 py-0.5 text-xs rounded ${t.color}`}>{t.label}</span>;
}

/* ============== 主页面 ============== */
export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [data, setData] = React.useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"overview" | "orders" | "transactions" | "apikeys">("overview");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const fetchUser = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUser(userId);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => { fetchUser(); }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error || "用户不存在"}</p>
          <button onClick={() => router.push("/admin/users")} className="px-4 py-2 text-sm text-primary hover:underline">返回用户列表</button>
        </div>
      </div>
    );
  }

  const role = getRoleLabel(data.role);
  const status = getUserStatusLabel(data.status);

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
            <button onClick={() => router.push("/admin/users")} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <IconBack size={20} className="text-gray-500" />
            </button>
            <h1 className="text-base font-semibold text-gray-800">用户详情</h1>
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
          {/* 用户信息卡 */}
          <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-semibold">
                {(data.displayName || data.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-800">{data.displayName || "-"}</h2>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${role.color}`}>{role.label}</span>
                  <span className={`inline-flex items-center gap-1 ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />{status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{data.email}</p>
                {data.phone && <p className="text-sm text-gray-500">{data.phone}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>ID: {data.id.slice(0, 12)}...</span>
                  <span>注册: {formatDate(data.createdAt)}</span>
                  {data.githubId && <span className="text-gray-600">GitHub ✓</span>}
                  {data.googleId && <span className="text-gray-600">Google ✓</span>}
                  {data.wechatId && <span className="text-gray-600">微信 ✓</span>}
                </div>
              </div>
            </div>
          </div>

          {/* 指标卡 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard label="可用余额" value={`¥${formatAmount(data.balance?.available ?? 0)}`} />
            <MetricCard label="本月消费" value={`¥${formatAmount(data.stats.monthlySpend)}`} sub={`${data.stats.monthlyRequests} 次调用`} />
            <MetricCard label="本月充值" value={`¥${formatAmount(data.stats.monthlyRecharge)}`} />
            <MetricCard label="本月 Token" value={formatNumber(data.stats.monthlyTotalTokens)} sub={`输入 ${formatNumber(data.stats.monthlyPromptTokens)} / 输出 ${formatNumber(data.stats.monthlyCompletionTokens)}`} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-gray-100">
            {(["overview", "orders", "transactions", "apikeys"] as const).map((tab) => {
              const labels = { overview: "概览", orders: "订单", transactions: "交易", apikeys: "API Key" };
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab 内容 */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">消费统计</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">总消费</span><span className="text-gray-800">¥{formatAmount(data.stats.totalSpend)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">总充值</span><span className="text-gray-800">¥{formatAmount(data.stats.totalRecharge)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">API Key 数</span><span className="text-gray-800">{data.stats.apiKeyCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">总调用次数</span><span className="text-gray-800">{formatNumber(data.stats.requestCount)}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">余额详情</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">总余额</span><span className="text-gray-800">¥{formatAmount(data.balance?.amount ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">冻结金额</span><span className="text-gray-800">¥{formatAmount(data.balance?.frozen ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">可用余额</span><span className="text-primary font-medium">¥{formatAmount(data.balance?.available ?? 0)}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="font-normal text-left px-4 py-3 text-[13px]">订单号</th>
                    <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">支付方式</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">暂无订单</td></tr>
                  ) : data.recentOrders.map((o) => {
                    const s = getOrderStatusLabel(o.status);
                    return (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{o.orderNo}</td>
                        <td className="px-4 py-3 text-[13px] text-right text-gray-800">¥{formatAmount(o.amount)}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">{getPaymentMethodLabel(o.paymentMethod)}</td>
                        <td className="px-4 py-3 text-[13px]"><span className={`inline-flex items-center gap-1.5 ${s.color}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />{s.label}</span></td>
                        <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(o.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="font-normal text-left px-4 py-3 text-[13px]">类型</th>
                    <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
                    <th className="font-normal text-right px-4 py-3 text-[13px]">余额</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">备注</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">暂无交易</td></tr>
                  ) : data.recentTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-[13px]"><TransactionTypeBadge type={t.type} /></td>
                      <td className={`px-4 py-3 text-[13px] text-right font-mono ${t.amount >= 0 ? "text-success" : "text-red-600"}`}>
                        {t.amount >= 0 ? "+" : ""}{formatAmount(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">¥{formatAmount(t.balanceAfter)}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-600">{t.remark || "-"}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "apikeys" && (
            <div className="bg-white rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="font-normal text-left px-4 py-3 text-[13px]">名称</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">Key 前缀</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                    <th className="font-normal text-right px-4 py-3 text-[13px]">调用次数</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">最后使用</th>
                    <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApiKeys.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">暂无 API Key</td></tr>
                  ) : data.recentApiKeys.map((k) => (
                    <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-[13px] text-gray-800">{k.name || "-"}</td>
                      <td className="px-4 py-3 text-[13px] font-mono text-gray-600">{k.keyPrefix}</td>
                      <td className="px-4 py-3 text-[13px]">
                        <span className={`inline-flex items-center gap-1.5 ${k.isActive ? "text-success" : "text-gray-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? "bg-success" : "bg-gray-400"}`} />
                          {k.isActive ? "启用" : "禁用"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">{formatNumber(k.totalRequests)}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500">{k.lastUsedAt ? formatDate(k.lastUsedAt) : "-"}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(k.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
