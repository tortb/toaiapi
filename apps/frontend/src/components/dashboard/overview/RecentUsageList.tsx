"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentUsageItem {
  id: string;
  model: string;
  timestamp: string;
  costActual: number;
  costStandard: number;
  tokens: number;
}

interface RecentUsageListProps {
  data: RecentUsageItem[];
  isLoading?: boolean;
  className?: string;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + "M";
  if (tokens >= 1_000) return (tokens / 1_000).toFixed(1) + "K";
  return tokens.toString();
}

function formatCost(cents: number): string {
  return "$" + (cents / 100).toFixed(4);
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}天前`;
}

export function RecentUsageList({
  data,
  isLoading,
  className,
}: RecentUsageListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
      >
        <Clock className="h-8 w-8 text-neutral-300" />
        <p className="mt-3 text-sm text-neutral-500">暂无使用记录</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {data.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3 transition-colors hover:bg-neutral-50"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-neutral-900">
                  {item.model}
                </span>
                <Badge variant="neutral" className="shrink-0 text-[10px]">
                  {formatTokens(item.tokens)}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">
                {formatTime(item.timestamp)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-sm font-mono font-medium text-neutral-900">
              {formatCost(item.costActual)}
            </p>
            <p className="text-[10px] font-mono text-neutral-400">
              标准 {formatCost(item.costStandard)}
            </p>
          </div>
        </div>
      ))}

      <Link
        href="/dashboard/logs"
        className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      >
        查看全部
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
