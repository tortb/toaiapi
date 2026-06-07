"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/dashboard/ui/Toast";

import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import { BalanceCard } from "@/components/dashboard/overview/BalanceCard";
import { TodayUsageCard } from "@/components/dashboard/overview/TodayUsageCard";
import { TokenStatsRow } from "@/components/dashboard/overview/TokenStatsRow";
import { PerformanceMetrics } from "@/components/dashboard/overview/PerformanceMetrics";
import { PlatformBreakdown } from "@/components/dashboard/overview/PlatformBreakdown";
import { ModelDistributionTable } from "@/components/dashboard/overview/ModelDistributionTable";
import { TokenUsageTrend } from "@/components/dashboard/overview/TokenUsageTrend";
import { QuickActions } from "@/components/dashboard/overview/QuickActions";
import { RecentUsageList } from "@/components/dashboard/overview/RecentUsageList";

interface OverviewStats {
  balance: { amount: number; frozen: number; available: number };
  apiKeys: { total: number; enabled: number };
  today: {
    requests: number;
    costActual: number;
    costStandard: number;
    tokensInput: number;
    tokensOutput: number;
    tokensTotal: number;
  };
  cumulative: {
    tokensInput: number;
    tokensOutput: number;
    tokensTotal: number;
  };
  performance: {
    rpm: number;
    tpm: number;
    avgLatencyMs: number;
  };
  platformBreakdown: Array<{
    platform: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
  modelDistribution: Array<{
    model: string;
    requests: number;
    tokens: number;
    costActual: number;
    costStandard: number;
  }>;
  tokenTrend: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
  recentUsage: Array<{
    id: string;
    model: string;
    timestamp: string;
    costActual: number;
    costStandard: number;
    tokens: number;
  }>;
}

export default function OverviewPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const [stats, setStats] = React.useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("7d");
  const [granularity, setGranularity] = React.useState<"day" | "hour">("day");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchStats = React.useCallback(async (p: string, g: string) => {
    try {
      const data = await authApi.get<OverviewStats>(`/balance/stats?period=${p}&granularity=${g}`);
      setStats(data);
    } catch (error: any) {
      toast("error", error.message || "获取统计数据失败");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    fetchStats(period, granularity);
  }, [isAuthenticated, router, period, granularity, fetchStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats(period, granularity);
  };

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              用量概览
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              欢迎回来，{user?.displayName || user?.email}。查看您的账户状态和模型使用趋势。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-1">
              {["7d", "30d", "90d"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    period === p
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  {p === "7d" ? "近7天" : p === "30d" ? "近30天" : "近90天"}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-1">
              {(["day", "hour"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    granularity === g
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  {g === "day" ? "按天" : "按小时"}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 gap-2"
            >
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              刷新
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Stats Column */}
          <div className="space-y-6 lg:col-span-3">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <BalanceCard
                amount={stats?.balance.amount || 0}
                available={stats?.balance.available || 0}
                isLoading={isLoading}
              />
              <TodayUsageCard
                requests={stats?.today.requests || 0}
                costActual={stats?.today.costActual || 0}
                costStandard={stats?.today.costStandard || 0}
                isLoading={isLoading}
              />
            </div>

            {/* Middle Section: Token Stats & Performance */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <TokenStatsRow
                today={{
                  total: stats?.today.tokensTotal || 0,
                  input: stats?.today.tokensInput || 0,
                  output: stats?.today.tokensOutput || 0,
                }}
                cumulative={{
                  total: stats?.cumulative.tokensTotal || 0,
                  input: stats?.cumulative.tokensInput || 0,
                  output: stats?.cumulative.tokensOutput || 0,
                }}
                isLoading={isLoading}
              />
              <PerformanceMetrics
                rpm={stats?.performance.rpm || 0}
                tpm={stats?.performance.tpm || 0}
                avgLatencyMs={stats?.performance.avgLatencyMs || 0}
                isLoading={isLoading}
              />
            </div>

            {/* Trend Chart */}
            <TokenUsageTrend
              data={stats?.tokenTrend || []}
              isLoading={isLoading}
            />

            {/* Distribution Table */}
            <ModelDistributionTable
              data={stats?.modelDistribution || []}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6 lg:col-span-1">
            <PlatformBreakdown
              data={stats?.platformBreakdown || []}
              isLoading={isLoading}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900">最近使用</h3>
              <RecentUsageList
                data={stats?.recentUsage || []}
                isLoading={isLoading}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900">快捷操作</h3>
              <QuickActions />
            </div>

            {/* Help/Support Card */}
            <div className="rounded-2xl bg-neutral-900 p-6 text-white">
              <h4 className="font-semibold">遇到问题？</h4>
              <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                如果您在集成过程中遇到任何问题，请查阅我们的开发文档或联系技术支持。
              </p>
              <a
                href="/docs"
                target="_blank"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-neutral-700 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                查看文档
              </a>
            </div>
          </div>
        </div>
      </div>
    </UserConsoleLayout>
  );
}
