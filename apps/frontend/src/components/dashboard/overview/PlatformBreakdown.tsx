"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface PlatformBreakdownItem {
  platform: string;
  cost: number;
  requests: number;
  tokens: number;
}

interface PlatformBreakdownProps {
  data: PlatformBreakdownItem[];
  isLoading?: boolean;
  className?: string;
}

export function PlatformBreakdown({
  data,
  isLoading,
  className,
}: PlatformBreakdownProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-[200px] w-full rounded-2xl", className)} />;
  }

  if (data.length === 0) {
    return (
      <div className={cn("flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400", className)}>
        暂无平台数据
      </div>
    );
  }

  const maxCost = Math.max(...data.map((d) => d.cost), 1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">按平台拆分</h3>
        <span className="text-[10px] text-neutral-400">{data.length} 个平台</span>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.platform} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-700">{item.platform}</span>
                <span className="text-[10px] text-neutral-400">
                  {item.requests} 请求
                </span>
              </div>
              <span className="font-mono font-medium text-neutral-900">
                ¥{item.cost.toFixed(4)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(item.cost / maxCost) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
