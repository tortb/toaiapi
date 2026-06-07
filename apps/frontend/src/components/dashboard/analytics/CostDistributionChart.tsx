"use client";

import * as React from "react";
import { ChartCard } from "@/components/ui/ChartCard";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";

interface CostData {
  model: string;
  cost: number;
  percentage: number;
}

interface CostDistributionChartProps {
  data: CostData[];
  isLoading?: boolean;
}

export function CostDistributionChart({ data, isLoading }: CostDistributionChartProps) {
  const [view, setView] = React.useState("bar");

  const maxCost = Math.max(...data.map((d) => d.cost), 1);
  const totalCost = data.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <ChartCard
      title="消耗分布"
      action={
        <Tabs
          items={[
            { label: "柱状图", value: "bar" },
            { label: "分布图", value: "distribution" },
          ]}
          value={view}
          onValueChange={setView}
          className="h-8"
        />
      }
      className="h-full"
    >
      <div className="flex flex-col h-[300px] justify-center">
        {view === "bar" ? (
          <div className="space-y-4">
            {data.slice(0, 6).map((item, i) => (
              <div key={item.model} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700 truncate max-w-[150px]">
                    {item.model}
                  </span>
                  <span className="font-mono text-neutral-900 font-bold">
                    ¥{item.cost.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      [
                        "bg-blue-500",
                        "bg-emerald-500",
                        "bg-purple-500",
                        "bg-amber-500",
                        "bg-rose-500",
                        "bg-indigo-500",
                      ][i % 6]
                    )}
                    style={{ width: `${(item.cost / maxCost) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full max-h-[250px] w-full">
              {data.slice(0, 10).map((item, i, arr) => {
                const prevItems = arr.slice(0, i);
                const prevPercentage = prevItems.reduce((acc, curr) => acc + curr.percentage, 0);
                const currentPercentage = item.percentage;

                // Donut Chart logic
                const radius = 35;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (currentPercentage / 100) * circumference;
                const rotation = (prevPercentage / 100) * 360;

                return (
                  <circle
                    key={item.model}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={[
                      "#3b82f6",
                      "#10b981",
                      "#8b5cf6",
                      "#f59e0b",
                      "#f43f5e",
                      "#6366f1",
                    ][i % 6]}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(${rotation - 90} 50 50)`}
                    className="transition-all duration-1000 ease-out"
                  />
                );
              })}
              <text x="50" y="48" textAnchor="middle" className="text-[6px] font-bold fill-neutral-400">总计</text>
              <text x="50" y="58" textAnchor="middle" className="text-[10px] font-bold fill-neutral-900">¥{totalCost.toFixed(2)}</text>
            </svg>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
