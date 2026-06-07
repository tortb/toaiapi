"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { Zap, Clock, Activity } from "lucide-react";

interface PerformanceMetricsProps {
  rpm: number;
  tpm: number;
  avgLatencyMs: number;
  isLoading?: boolean;
  className?: string;
}

export function PerformanceMetrics({
  rpm,
  tpm,
  avgLatencyMs,
  isLoading,
  className,
}: PerformanceMetricsProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-[120px] w-full rounded-2xl", className)} />;
  }

  const metrics = [
    {
      label: "RPM",
      value: rpm > 0 ? rpm.toFixed(1) : "—",
      sub: "请求 / 分钟",
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      bg: "bg-amber-50",
    },
    {
      label: "TPM",
      value: tpm > 999 ? (tpm / 1000).toFixed(1) + "K" : tpm > 0 ? tpm.toFixed(0) : "—",
      sub: "Token / 分钟",
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      bg: "bg-emerald-50",
    },
    {
      label: "平均延迟",
      value: avgLatencyMs > 0 ? (avgLatencyMs / 1000).toFixed(2) + "s" : "—",
      sub: "秒 / 请求",
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      {metrics.map((m) => (
        <div
          key={m.label}
          className="group flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-white p-4 text-center transition-all hover:border-neutral-200 hover:shadow-sm"
        >
          <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:scale-110", m.bg)}>
            {m.icon}
          </div>
          <div className="text-xl font-bold text-neutral-900">{m.value}</div>
          <div className="text-[10px] font-medium text-neutral-400">{m.label}</div>
          <div className="mt-0.5 text-[8px] text-neutral-300">{m.sub}</div>
        </div>
      ))}
    </div>
  );
}
