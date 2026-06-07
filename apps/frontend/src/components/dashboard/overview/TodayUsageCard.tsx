"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface TodayUsageCardProps {
  requests: number;
  costActual: number;
  costStandard: number;
  isLoading?: boolean;
  className?: string;
}

export function TodayUsageCard({
  requests,
  costActual,
  costStandard,
  isLoading,
  className,
}: TodayUsageCardProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-[160px] w-full rounded-2xl", className)} />;
  }

  const ratio = costStandard > 0 ? (costActual / costStandard) * 100 : 0;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-500">今日消耗</p>
          <div className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
            {requests} 请求
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            ¥{costActual.toFixed(4)}
          </h2>
          <span className="text-xs text-neutral-400 line-through">
            ¥{costStandard.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">实付占比</span>
          <span className="font-medium text-neutral-900">{ratio.toFixed(1)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(100, ratio)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
