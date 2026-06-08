"use client";

import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getModels, type ModelData } from "@/lib/admin-api";

function price(value: number | null | undefined) { return value == null ? "-" : "¥" + value; }

export default function AdminPricingPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getModels(params), []);
  const columns: AdminResourceColumn<ModelData>[] = [
    { header: "模型", render: (item) => <div><div className="font-medium">{item.displayName}</div><div className="text-xs text-[var(--text-muted)]">{item.name}</div></div> },
    { header: "输入", width: "120px", render: (item) => price(item.pricing?.inputPrice) },
    { header: "输出", width: "120px", render: (item) => price(item.pricing?.outputPrice) },
    { header: "缓存", width: "120px", render: (item) => price(item.pricing?.cachedPrice) },
    { header: "推理", width: "120px", render: (item) => price(item.pricing?.reasoningPrice) },
    { header: "倍率", width: "100px", render: (item) => String(item.pricing?.multiplier ?? "-") },
  ];
  return <AdminResourceList title="价格策略" description="查看模型计费价格" searchPlaceholder="搜索模型" loadData={loadData} columns={columns} />;
}
