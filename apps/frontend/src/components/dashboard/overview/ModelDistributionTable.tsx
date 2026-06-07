"use client";

import * as React from "react";
import { Table, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface ModelDistribution {
  model: string;
  requests: number;
  tokens: number;
  costActual: number;
  costStandard: number;
}

interface ModelDistributionTableProps {
  data: ModelDistribution[];
  isLoading?: boolean;
  className?: string;
}

export function ModelDistributionTable({
  data,
  isLoading,
  className,
}: ModelDistributionTableProps) {
  const columns: TableColumn<ModelDistribution>[] = [
    {
      key: "model",
      title: "模型",
      render: (row) => (
        <span className="font-medium text-neutral-900">{row.model}</span>
      ),
    },
    {
      key: "requests",
      title: "请求数",
      render: (row) => row.requests.toLocaleString(),
    },
    {
      key: "tokens",
      title: "Token",
      render: (row) => {
        if (row.tokens < 1000) return row.tokens;
        if (row.tokens < 1000000) return (row.tokens / 1000).toFixed(1) + "K";
        return (row.tokens / 1000000).toFixed(1) + "M";
      },
    },
    {
      key: "cost",
      title: "实际消耗",
      render: (row) => (
        <span className="font-mono font-medium text-emerald-600">
          ¥{row.costActual.toFixed(4)}
        </span>
      ),
    },
    {
      key: "standard",
      title: "标准价格",
      render: (row) => (
        <span className="font-mono text-neutral-400 line-through">
          ¥{row.costStandard.toFixed(4)}
        </span>
      ),
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">模型消耗分布</h3>
      </div>
      <Table
        columns={columns}
        data={data}
        rowKey="model"
        loading={isLoading}
        empty={<EmptyState title="暂无模型使用数据" />}
      />
    </div>
  );
}
