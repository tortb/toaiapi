"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface TokenStatsCardProps {
  label: string;
  total: number;
  input: number;
  output: number;
  isLoading?: boolean;
  className?: string;
}

function formatToken(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1000000) return (n / 1000).toFixed(1) + "K";
  return (n / 1000000).toFixed(1) + "M";
}

export function TokenStatsRow({
  today,
  cumulative,
  isLoading,
  className,
}: {
  today: { total: number; input: number; output: number };
  cumulative: { total: number; input: number; output: number };
  isLoading?: boolean;
  className?: string;
}) {
  if (isLoading) {
    return <Skeleton className={cn("h-[100px] w-full rounded-2xl", className)} />;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      <TokenStatsCard label="今日 Token" {...today} />
      <TokenStatsCard label="累计 Token" {...cumulative} />
    </div>
  );
}

function TokenStatsCard({
  label,
  total,
  input,
  output,
}: {
  label: string;
  total: number;
  input: number;
  output: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all hover:bg-neutral-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        <span className="text-lg font-bold text-neutral-900">
          {formatToken(total)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-2">
        <div>
          <p className="text-[10px] text-neutral-400">输入 (Prompt)</p>
          <p className="text-xs font-semibold text-neutral-700">
            {formatToken(input)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-400">输出 (Completion)</p>
          <p className="text-xs font-semibold text-neutral-700">
            {formatToken(output)}
          </p>
        </div>
      </div>
    </div>
  );
}
