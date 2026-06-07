"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface MarketShareItem {
  vendor: string;
  tokens: number;
  percentage: number;
}

interface MarketShareProps {
  data: MarketShareItem[];
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

export function MarketShare({ data, isLoading }: MarketShareProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-neutral-400 text-sm">
        暂无市场份额数据
      </div>
    );
  }

  const totalTokens = data.reduce((s, d) => s + d.tokens, 0);

  // 计算饼图路径
  const radius = 80;
  const cx = 100;
  const cy = 100;
  let currentAngle = -Math.PI / 2;

  const slices = data.map((item, i) => {
    const angle = (item.percentage / 100) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path,
      color: COLORS[i % COLORS.length],
      ...item,
    };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900">市场份额</h3>
      <p className="text-xs text-neutral-500">最近几周内各厂商的 Token 占比</p>
      <div className="flex items-center gap-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice) => (
            <path
              key={slice.vendor}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
          <circle cx={cx} cy={cy} r="40" fill="white" />
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="text-[10px] fill-neutral-400"
          >
            总计
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            className="text-xs font-bold fill-neutral-900"
          >
            {formatTokens(totalTokens)}
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          {slices.map((slice) => (
            <div key={slice.vendor} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-xs text-neutral-700 flex-1 truncate">
                {slice.vendor}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
