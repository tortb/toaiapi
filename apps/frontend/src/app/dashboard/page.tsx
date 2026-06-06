"use client";

/**
 * 用户仪表盘
 *
 * /dashboard — 余额概览、本月统计、消费趋势、快捷操作、最近订单
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import DashboardShell from "@/components/DashboardShell";
import {
  getBalanceStats,
  getDailyBills,
  getUserOrders,
  formatAmount,
  formatNumber,
  formatDate,
  getOrderStatusLabel,
  type BalanceStats,
  type DailyBill,
  type OrderInfo,
} from "@/lib/payment-api";

/* ============== 简易柱状图（7天） ============== */
function MiniBarChart({ data, maxHeight = 80 }: { data: DailyBill[]; maxHeight?: number }) {
  if (data.length === 0) return null;
  const maxCost = Math.max(...data.map((d) => d.cost), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height: maxHeight }}>
      {data.map((d) => {
        const height = Math.max(2, (d.cost / maxCost) * maxHeight);
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer"
              style={{ height }}
              title={`${d.date}: ¥${formatAmount(d.cost)} / ${d.requests} 次`}
            />
            <span className="text-[10px] text-gray-400">{d.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============== 主页面 ============== */
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [dailyBills, setDailyBills] = React.useState<DailyBill[]>([]);
  const [orders, setOrders] = React.useState<OrderInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, dailyData, ordersData] = await Promise.all([
          getBalanceStats(),
          getDailyBills(7),
          getUserOrders(1, 5),
        ]);
        setStats(statsData);
        setDailyBills(dailyData);
        setOrders(ordersData.items ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {/* 欢迎语 */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">
            你好，{user?.displayName || user?.email?.split("@")[0] || "用户"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">欢迎使用 ToAiAPI 控制台</p>
        </div>

        {/* 指标卡 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">可用余额</p>
            <p className="text-xl font-bold text-primary">¥{formatAmount(stats?.balance.available ?? 0)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">本月消费</p>
            <p className="text-xl font-bold text-gray-800">¥{formatAmount(stats?.monthlySpend ?? 0)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">本月请求数</p>
            <p className="text-xl font-bold text-gray-800">{formatNumber(stats?.monthlyRequests ?? 0)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">本月 Token</p>
            <p className="text-xl font-bold text-gray-800">{formatNumber(stats?.monthlyTotalTokens ?? 0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 消费趋势 */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-800">近 7 天消费趋势</h3>
              <Link href="/bills" className="text-xs text-primary hover:underline">查看详情 →</Link>
            </div>
            {dailyBills.length > 0 ? (
              <MiniBarChart data={dailyBills} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">暂无消费数据</p>
            )}
          </div>

          {/* 快捷操作 */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-800 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <Link href="/recharge" className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2962FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">充值</p>
                  <p className="text-xs text-gray-500">为账户充值</p>
                </div>
              </Link>
              <Link href="/dashboard/apikeys" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">API Keys</p>
                  <p className="text-xs text-gray-500">管理密钥</p>
                </div>
              </Link>
              <Link href="/models" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">模型列表</p>
                  <p className="text-xs text-gray-500">查看可用模型</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 最近订单 */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">最近订单</h3>
            <Link href="/recharge" className="text-xs text-primary hover:underline">查看全部 →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="font-normal text-left px-4 py-3 text-[13px]">订单号</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">暂无订单记录</td></tr>
              ) : orders.map((o) => {
                const status = getOrderStatusLabel(o.status);
                return (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] text-gray-700 font-mono">{o.orderNo}</td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-800 font-mono">¥{formatAmount(o.amount)}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">{formatDate(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
