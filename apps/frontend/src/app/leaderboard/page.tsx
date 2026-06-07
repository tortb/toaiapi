"use client";

import * as React from "react";
import SiteShell from "@/components/SiteShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/dashboard/ui/Toast";
import { getLeaderboard, type LeaderboardResponse } from "@/lib/user-api";

import { TimeRangeSelector } from "@/components/leaderboard/TimeRangeSelector";
import { HotModels } from "@/components/leaderboard/HotModels";
import { LLMLeaderboard } from "@/components/leaderboard/LLMLeaderboard";
import { MarketShare } from "@/components/leaderboard/MarketShare";
import { RisingTrends } from "@/components/leaderboard/RisingTrends";
import { FallingTrends } from "@/components/leaderboard/FallingTrends";

export default function LeaderboardPage() {
  const { toast } = useToast();

  const [period, setPeriod] = React.useState("week");
  const [data, setData] = React.useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    getLeaderboard(period)
      .then(setData)
      .catch((err) => {
        toast("error", err.message || "加载排行榜失败");
      })
      .finally(() => setIsLoading(false));
  }, [period, toast]);

  return (
    <SiteShell>
      {/* Hero */}
      <div className="relative overflow-hidden bg-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              排行榜
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-neutral-400 leading-relaxed">
              探索平台上使用最多的模型和增长中的供应商，数据基于实时用量更新。
            </p>
            <div className="mt-8">
              <TimeRangeSelector value={period} onChange={setPeriod} />
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="h-[350px] rounded-2xl" />
            <Skeleton className="h-[350px] rounded-2xl" />
            <Skeleton className="h-[350px] rounded-2xl" />
            <Skeleton className="h-[350px] rounded-2xl" />
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Hot Models + LLM Leaderboard */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <HotModels
                  data={data.hotModels.map((m) => ({
                    model: m.model,
                    tokens: m.tokens,
                  }))}
                />
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <LLMLeaderboard data={data.leaderboard} />
              </div>
            </div>

            {/* Market Share + Rising/Falling */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <MarketShare data={data.marketShare} />
              </div>
              <div className="space-y-8">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <RisingTrends data={data.rising} />
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <FallingTrends data={data.falling} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-500">暂无排行榜数据</p>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
