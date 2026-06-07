"use client";

import * as React from "react";
import { Table, type TableColumn } from "@/components/ui/Table";

interface ModelAnalysis {
  model: string;
  calls: number;
  tokens: number;
}

interface ModelCallAnalysisProps {
  data: ModelAnalysis[];
  isLoading?: boolean;
}

export function ModelCallAnalysis({ data, isLoading }: ModelCallAnalysisProps) {
  const columns: TableColumn<ModelAnalysis>[] = [
    {
      key: "rank",
      title: "排名",
      render: (_, i) => (
        <span className="flex h-5 w-5 items-center justify-center rounded bg-neutral-100 text-[10px] font-bold text-neutral-500">
          {i + 1}
        </span>
      ),
    },
    {
      key: "model",
      title: "模型名称",
      render: (row) => <span className="font-medium text-neutral-900">{row.model}</span>,
    },
    {
      key: "calls",
      title: "调用次数",
      className: "text-right",
      headerClassName: "text-right",
      render: (row) => row.calls.toLocaleString(),
    },
    {
      key: "tokens",
      title: "消耗 Token",
      className: "text-right",
      headerClassName: "text-right",
      render: (row) => {
        if (row.tokens < 1000) return row.tokens;
        if (row.tokens < 1000000) return (row.tokens / 1000).toFixed(1) + "K";
        return (row.tokens / 1000000).toFixed(1) + "M";
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">模型调用明细</h3>
      </div>
      <Table
        columns={columns}
        data={data}
        rowKey="model"
        loading={isLoading}
      />
    </div>
  );
}
