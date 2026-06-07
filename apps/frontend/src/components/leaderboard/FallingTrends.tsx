"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingDown } from "lucide-react";

interface TrendingModel {
  model: string;
  vendor: string;
  change: number;
  currentRank: number;
}

interface FallingTrendsProps {
  data: TrendingModel[];
  isLoading?: boolean;
}

export function FallingTrends({ data, isLoading }: FallingTrendsProps) {
  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-neutral-400 text-sm">
        暂无下降趋势数据
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-red-500" />
        下降趋势
      </h3>
      <p className="text-xs text-neutral-500">排名下滑的模型</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div
            key={item.model}
            className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {item.model}
              </p>
              <p className="text-[10px] text-neutral-500">{item.vendor}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                #{item.currentRank}
              </span>
              <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                <TrendingDown className="h-3 w-3" />
                {item.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
