"use client";

import * as React from "react";
import { ChartCard } from "@/components/ui/ChartCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  tokens: number;
  cost: number;
}

interface TokenUsageTrendProps {
  data: DataPoint[];
  isLoading?: boolean;
  className?: string;
}

export function TokenUsageTrend({ data, isLoading, className }: TokenUsageTrendProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-[300px] w-full rounded-2xl", className)} />;
  }

  const maxTokens = Math.max(...data.map((d) => d.tokens), 1);
  const padding = 20;
  const width = 800;
  const height = 200;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - (d.tokens / maxTokens) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <ChartCard title="Token 使用趋势" className={cn("bg-white", className)}>
      <div className="relative h-[200px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={padding}
              y1={height - padding - p * (height - padding * 2)}
              x2={width - padding}
              y2={height - padding - p * (height - padding * 2)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Area */}
          <polyline
            points={areaPoints}
            fill="url(#trendGradient)"
            className="transition-all duration-700"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700"
          />

          {/* Definitions */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - (d.tokens / maxTokens) * (height - padding * 2) - padding;
            return (
              <g key={i} className="group/point">
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#fff"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="opacity-0 transition-opacity group-hover/point:opacity-100"
                />
                <foreignObject
                  x={x - 50}
                  y={y - 45}
                  width="100"
                  height="40"
                  className="pointer-events-none opacity-0 transition-opacity group-hover/point:opacity-100"
                >
                  <div className="flex flex-col items-center justify-center rounded bg-neutral-900 px-2 py-1 text-[10px] text-white">
                    <span className="font-medium">{d.date}</span>
                    <span className="text-neutral-400">{(d.tokens / 1000).toFixed(1)}K tokens</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="mt-2 flex justify-between px-[20px] text-[10px] text-neutral-400">
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => (
            <span key={i}>{d.date.split("-").slice(1).join("/")}</span>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
