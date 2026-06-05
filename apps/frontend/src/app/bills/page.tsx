"use client";

/**
 * 账单中心（用户端）
 *
 * /bills — 余额、消费统计、消费趋势、消费明细
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getBalanceStats,
  getDailyBills,
  getBills,
  formatAmount,
  formatNumber,
  formatDate,
  type BalanceStats,
  type DailyBill,
  type BillItem,
} from "@/lib/payment-api";

/* ============== 简易柱状图 ============== */
function BarChart({ data, maxHeight = 120 }: { data: DailyBill[]; maxHeight?: number }) {
  if (data.length === 0) return null;
  const maxCost = Math.max(...data.map((d) => d.cost), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: maxHeight }}>
      {data.slice(-14).map((d) => {
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
export default function BillsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [dailyBills, setDailyBills] = React.useState<DailyBill[]>([]);
  const [bills, setBills] = React.useState<BillItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
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
        const [statsData, dailyData] = await Promise.all([
          getBalanceStats(),
          getDailyBills(30),
        ]);
        setStats(statsData);
        setDailyBills(dailyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const loadBills = async () => {
      try {
        const res = await getBills(page, 20);
        setBills(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        // 静默失败
      }
    };
    loadBills();
  }, [isAuthenticated, page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-800">账单中心</h1>
          <a href="/recharge" className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-600">充值</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {/* 指标卡 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">可用余额</p>
            <p className="text-xl font-bold text-primary">¥{formatAmount(stats?.balance.available ?? 0)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">本月消费</p>
            <p className="text-xl font-bold text-gray-800">¥{formatAmount(stats?.monthlySpend ?? 0)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">本月充值</p>
            <p className="text-xl font-bold text-gray-800">¥{formatAmount(stats?.monthlyRecharge ?? 0)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">本月 Token</p>
            <p className="text-xl font-bold text-gray-800">{formatNumber(stats?.monthlyTotalTokens ?? 0)}</p>
          </div>
        </div>

        {/* 消费趋势图 */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-4">近 14 天消费趋势</h3>
          {dailyBills.length > 0 ? (
            <BarChart data={dailyBills} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">暂无消费数据</p>
          )}
        </div>

        {/* 消费明细 */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-800">消费明细</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="font-normal text-left px-4 py-3 text-[13px]">时间</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">接口</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">输入 Token</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">输出 Token</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">费用</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">状态</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">暂无消费记录</td></tr>
              ) : bills.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[13px] text-gray-500">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-700 font-mono text-xs">{b.endpoint}</td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">{formatNumber(b.promptTokens)}</td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">{formatNumber(b.completionTokens)}</td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-800 font-mono">¥{formatAmount(b.cost)}</td>
                  <td className="px-4 py-3 text-[13px] text-right">
                    <span className={b.statusCode < 400 ? "text-success" : "text-red-500"}>
                      {b.statusCode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>共 {total} 条</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">上一页</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">下一页</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
