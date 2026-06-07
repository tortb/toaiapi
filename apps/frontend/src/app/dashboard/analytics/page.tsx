"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/dashboard/ui/Toast";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAnalytics,
  type AnalyticsResponse,
} from "@/lib/user-api";

import { StatsSummaryCards } from "@/components/dashboard/analytics/StatsSummaryCards";
import { CostDistributionChart } from "@/components/dashboard/analytics/CostDistributionChart";
import { CallTrendChart } from "@/components/dashboard/analytics/CallTrendChart";
import { ModelCallAnalysis } from "@/components/dashboard/analytics/ModelCallAnalysis";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("7d");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchData = React.useCallback(
    async (p: string) => {
      try {
        const res = await getAnalytics(p);
        setData(res);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "获取分析数据失败";
        toast("error", message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    fetchData(period);
  }, [isAuthenticated, router, period, fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(period);
  };

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              数据看板
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              深入分析您的模型调用行为、成本分布与性能指标。
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
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 gap-2"
            >
              <RefreshCcw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              刷新
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-[100px] rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-[300px] rounded-xl" />
              <Skeleton className="h-[300px] rounded-xl" />
            </div>
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Summary Section */}
            <StatsSummaryCards summary={data.summary} isLoading={false} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <CostDistributionChart
                data={data.costDistribution}
                isLoading={false}
              />
              <CallTrendChart data={data.callTrend} isLoading={false} />
            </div>

            {/* Analysis Table */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <ModelCallAnalysis
                data={data.modelCallAnalysis}
                isLoading={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-500">暂无分析数据</p>
          </div>
        )}
      </div>
    </UserConsoleLayout>
  );
}
