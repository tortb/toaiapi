"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface HotModel {
  model: string;
  tokens: number;
}

interface HotModelsProps {
  data: HotModel[];
  isLoading?: boolean;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(1) + "B";
  if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + "M";
  if (tokens >= 1_000) return (tokens / 1_000).toFixed(1) + "K";
  return tokens.toString();
}

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

export function HotModels({ data, isLoading }: HotModelsProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-neutral-400 text-sm">
        暂无历史数据
      </div>
    );
  }

  const maxTokens = Math.max(...data.map((d) => d.tokens), 1);
  const top10 = data.slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900">热门模型</h3>
      <p className="text-xs text-neutral-500">最近几周内各模型的每周 Token 用量</p>
      <div className="space-y-3">
        {top10.map((item, i) => (
          <div key={item.model} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">
                {item.model}
              </span>
              <span className="text-neutral-500 font-mono">
                {formatTokens(item.tokens)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(item.tokens / maxTokens) * 100}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
