"use client";

import * as React from "react";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardItem {
  rank: number;
  model: string;
  vendor: string;
  requests: number;
  tokens: number;
  change: number;
}

interface LLMLeaderboardProps {
  data: LeaderboardItem[];
  isLoading?: boolean;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + "M";
  if (tokens >= 1_000) return (tokens / 1_000).toFixed(1) + "K";
  return tokens.toString();
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        3
      </span>
    );
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-500">
      {rank}
    </span>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-emerald-600">
        <TrendingUp className="h-3 w-3" />+{change}
      </span>
    );
  if (change < 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-red-500">
        <TrendingDown className="h-3 w-3" />
        {change}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-xs text-neutral-400">
      <Minus className="h-3 w-3" />0
    </span>
  );
}

export function LLMLeaderboard({ data, isLoading }: LLMLeaderboardProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  const columns: TableColumn<LeaderboardItem>[] = [
    {
      key: "rank",
      title: "排名",
      className: "w-16",
      render: (row) => <RankBadge rank={row.rank} />,
    },
    {
      key: "model",
      title: "模型",
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.model}</p>
          <p className="text-[10px] text-neutral-400">{row.vendor}</p>
        </div>
      ),
    },
    {
      key: "requests",
      title: "请求数",
      headerClassName: "text-right",
      className: "text-right font-mono text-neutral-600",
      render: (row) => row.requests.toLocaleString(),
    },
    {
      key: "tokens",
      title: "Token 数",
      headerClassName: "text-right",
      className: "text-right font-mono text-neutral-600",
      render: (row) => formatTokens(row.tokens),
    },
    {
      key: "change",
      title: "变化",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => <ChangeIndicator change={row.change} />,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900">LLM 排行榜</h3>
      <p className="text-xs text-neutral-500">对比平台上最受欢迎的模型</p>
      {data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-neutral-400 text-sm">
          没有匹配筛选条件的模型
        </div>
      ) : (
        <Table
          columns={columns}
          data={data}
          rowKey="model"
          className="border-0 shadow-none"
        />
      )}
    </div>
  );
}
