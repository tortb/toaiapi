"use client";

/**
 * 使用统计
 *
 * /dashboard/usage — Token 消耗趋势、模型占比、成本统计
 */

import React from "react";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import StatCard from "@/components/dashboard/ui/StatCard";
import StatChart from "@/components/dashboard/ui/StatChart";
import { IconToken, IconRefresh } from "@/components/dashboard/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  getDailyBills,
  getBalanceStats,
  type DailyBill,
  type BalanceStats,
} from "@/lib/payment-api";

/* ============== 简易折线图 ============== */

function Sparkline({
  data,
  height = 60,
}: {
  data: { day: string; tokens: number }[];
  height?: number;
}) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.tokens), 1);
  const w = 100 / data.length;

  return (
    <div className="relative" style={{ height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${data.length * 10} ${height}`}
        className="overflow-visible"
      >
        {/* 面积填充 */}
        <path
          d={`M0,${height} ${data
            .map(
              (d, i) =>
                `L${i * 10 + 5},${height - (d.tokens / maxVal) * (height - 8) - 4}`
            )
            .join(" ")} L${(data.length - 1) * 10 + 5},${height} Z`}
          fill="url(#gradient)"
          opacity={0.15}
        />
        {/* 折线 */}
        <path
          d={`M5,${
            height - (data[0].tokens / maxVal) * (height - 8) - 4
          } ${data
            .map(
              (d, i) =>
                `L${i * 10 + 5},${height - (d.tokens / maxVal) * (height - 8) - 4}`
            )
            .join(" ")}`}
          fill="none"
          stroke="#2962FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 终点圆点 */}
        <circle
          cx={(data.length - 1) * 10 + 5}
          cy={
            height -
            (data[data.length - 1].tokens / maxVal) * (height - 8) -
            4
          }
          r="3"
          fill="#2962FF"
          stroke="white"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2962FF" />
            <stop offset="1" stopColor="#2962FF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* X 轴标签 */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{data[0]?.day}</span>
        <span className="text-[10px] text-gray-400">
          {data[data.length - 1]?.day}
        </span>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */

export default function UsagePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [period, setPeriod] = React.useState("30d");
  const [dailyBills, setDailyBills] = React.useState<DailyBill[]>([]);
  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [billsData, statsData] = await Promise.all([
          getDailyBills(days),
          getBalanceStats(),
        ]);
        setDailyBills(billsData);
        setStats(statsData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "加载数据失败";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router, period]);

  const trendData = React.useMemo(
    () =>
      dailyBills.map((b) => ({
        day: b.date.slice(5), // MM-DD
        tokens: b.tokens,
      })),
    [dailyBills]
  );

  const totalTokens = dailyBills.reduce((s, b) => s + b.tokens, 0);
  const totalCost = dailyBills.reduce((s, b) => s + b.cost, 0);
  const totalRequests = dailyBills.reduce((s, b) => s + b.requests, 0);
  const avgDailyTokens = dailyBills.length > 0 ? Math.round(totalTokens / dailyBills.length) : 0;

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">使用统计</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              查看 Token 消耗、请求量和成本统计
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-1">
              {["7d", "30d", "90d"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    period === p
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {p === "7d" ? "7天" : p === "30d" ? "30天" : "90天"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* KPI 卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="总 Token"
            value={
              isLoading
                ? "..."
                : totalTokens >= 1_000_000
                ? (totalTokens / 1_000_000).toFixed(1) + "M"
                : totalTokens >= 1_000
                ? (totalTokens / 1_000).toFixed(1) + "K"
                : totalTokens.toString()
            }
            subtitle={isLoading ? "" : `日均 ${(avgDailyTokens / 1_000_000).toFixed(1)}M`}
            icon={<IconToken size={14} />}
          />
          <StatCard
            title="总请求"
            value={isLoading ? "..." : totalRequests.toLocaleString()}
            subtitle={
              isLoading
                ? ""
                : `日均 ${Math.round(totalRequests / (dailyBills.length || 1)).toLocaleString()}`
            }
          />
          <StatCard
            title="总费用"
            value={isLoading ? "..." : `$${(totalCost / 100).toFixed(2)}`}
          />
          <StatCard
            title="余额"
            value={
              isLoading
                ? "..."
                : `$${((stats?.balance.available || 0) / 100).toFixed(2)}`
            }
            subtitle={isLoading ? "" : "可用额度"}
          />
        </div>

        {/* Token 趋势 */}
        <div className="mb-6">
          {isLoading ? (
            <Skeleton className="h-[200px] w-full rounded-xl" />
          ) : (
            <StatChart
              title="Token 消耗趋势"
              periods={[
                { key: "7d", label: "7天" },
                { key: "30d", label: "30天" },
                { key: "90d", label: "90天" },
              ]}
              activePeriod={period}
              onChangePeriod={setPeriod}
            >
              <Sparkline data={trendData} />
            </StatChart>
          )}
        </div>

        {/* 模型分布 */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        ) : dailyBills.length === 0 ? (
          <EmptyState
            title="暂无使用数据"
            description="开始使用 API 后，您的消耗统计将在此展示。"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 每日消耗趋势 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                每日消耗
              </h3>
              <div className="space-y-3">
                {dailyBills.slice(-7).map((b) => {
                  const maxCost = Math.max(
                    ...dailyBills.slice(-7).map((d) => d.cost),
                    1
                  );
                  const pct = (b.cost / maxCost) * 100;
                  return (
                    <div key={b.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">
                          {b.date.slice(5)}
                        </span>
                        <span className="text-sm text-gray-500 font-mono">
                          ${(b.cost / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 每日请求量 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                每日请求量
              </h3>
              <div className="space-y-2">
                {dailyBills.slice(-7).map((b) => (
                  <div
                    key={b.date}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-700">
                      {b.date.slice(5)}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {b.requests.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 ml-2 font-mono">
                        {b.tokens >= 1_000_000
                          ? (b.tokens / 1_000_000).toFixed(1) + "M"
                          : b.tokens >= 1_000
                          ? (b.tokens / 1_000).toFixed(1) + "K"
                          : b.tokens}{" "}
                        tokens
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserConsoleLayout>
  );
}
