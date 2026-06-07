"use client";

import * as React from "react";
import { Users, Wallet, Zap, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsSummaryCardsProps {
  summary: {
    totalUsers: number;
    totalQuota: number;
    totalTokens: number;
    avgRpm: number;
    avgTpm: number;
  };
  isLoading?: boolean;
}

export function StatsSummaryCards({ summary, isLoading }: StatsSummaryCardsProps) {
  const cards = [
    {
      label: "总用户数",
      value: summary.totalUsers.toLocaleString(),
      sub: "当前统计范围内",
      icon: <Users className="h-4 w-4 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "总额度消耗",
      value: `¥${summary.totalQuota.toFixed(2)}`,
      sub: "实际扣费总计",
      icon: <Wallet className="h-4 w-4 text-emerald-500" />,
      bg: "bg-emerald-50",
    },
    {
      label: "总 Token 数",
      value: formatLargeNumber(summary.totalTokens),
      sub: "输入 + 输出",
      icon: <Activity className="h-4 w-4 text-purple-500" />,
      bg: "bg-purple-50",
    },
    {
      label: "平均 RPM",
      value: summary.avgRpm.toFixed(1),
      sub: "每分钟请求数",
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      bg: "bg-amber-50",
    },
    {
      label: "平均 TPM",
      value: formatLargeNumber(summary.avgTpm),
      sub: "每分钟 Token",
      icon: <Clock className="h-4 w-4 text-rose-500" />,
      bg: "bg-rose-50",
    },
  ];

  function formatLargeNumber(n: number): string {
    if (n < 1000) return n.toString();
    if (n < 1000000) return (n / 1000).toFixed(1) + "K";
    return (n / 1000000).toFixed(1) + "M";
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-neutral-150 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", card.bg)}>
              {card.icon}
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {card.label}
            </span>
          </div>
          <div className="text-xl font-bold text-neutral-900">{card.value}</div>
          <p className="mt-1 text-[10px] text-neutral-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
