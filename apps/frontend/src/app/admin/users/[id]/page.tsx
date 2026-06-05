"use client";

/**
 * 用户详情页
 *
 * /admin/users/[id]
 */

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
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
import { AdminShell } from "@/components/admin/AdminShell";

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

  const [data, setData] = React.useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"overview" | "orders" | "transactions" | "apikeys">("overview");

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
      <AdminShell title="用户详情">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (error || !data) {
    return (
      <AdminShell title="用户详情">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-4">{error || "用户不存在"}</p>
            <button onClick={() => router.push("/admin/users")} className="px-4 py-2 text-sm text-primary hover:underline">返回用户列表</button>
          </div>
        </div>
      </AdminShell>
    );
  }

  const role = getRoleLabel(data.role);
  const status = getUserStatusLabel(data.status);

  return (
    <AdminShell title="用户详情">
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
    </AdminShell>
  );
}
