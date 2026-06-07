"use client";

import * as React from "react";
import { ChartCard } from "@/components/ui/ChartCard";
import { cn } from "@/lib/utils";

interface CallData {
  date: string;
  calls: number;
  tokens: number;
}

interface CallTrendChartProps {
  data: CallData[];
  isLoading?: boolean;
}

export function CallTrendChart({ data, isLoading }: CallTrendChartProps) {
  if (data.length === 0) return null;

  const maxCalls = Math.max(...data.map((d) => d.calls), 1);
  const width = 800;
  const height = 250;
  const padding = 40;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - (d.calls / maxCalls) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <ChartCard title="调用趋势" className="h-full">
      <div className="relative h-[250px] w-full pt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Y-axis grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line
                x1={padding}
                y1={height - padding - p * (height - padding * 2)}
                x2={width - padding}
                y2={height - padding - p * (height - padding * 2)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={height - padding - p * (height - padding * 2)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-neutral-400 text-[10px]"
              >
                {Math.round(p * maxCalls)}
              </text>
            </g>
          ))}

          {/* Area */}
          <polyline
            points={areaPoints}
            fill="url(#callTrendGradient)"
            className="transition-all duration-1000"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />

          <defs>
            <linearGradient id="callTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* X-axis labels */}
          {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i, arr) => {
            const x = (data.indexOf(d) / (data.length - 1)) * (width - padding * 2) + padding;
            return (
              <text
                key={i}
                x={x}
                y={height - padding + 20}
                textAnchor="middle"
                className="fill-neutral-400 text-[10px]"
              >
                {d.date.split("-").slice(1).join("/")}
              </text>
            );
          })}
        </svg>
      </div>
    </ChartCard>
  );
}
