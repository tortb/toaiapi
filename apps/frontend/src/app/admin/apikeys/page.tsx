"use client";

import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getApiKeys, type ApiKeyAdminData } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";

export default function AdminApiKeysPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getApiKeys(params), []);
  const columns: AdminResourceColumn<ApiKeyAdminData>[] = [
    { header: "Key", render: (item) => <div><div className="font-mono text-xs">{item.keyPrefix}</div><div className="text-xs text-[var(--text-muted)]">{item.name || "未命名"}</div></div> },
    { header: "用户", render: (item) => <div><div>{item.userEmail}</div><div className="text-xs text-[var(--text-muted)]">{item.userName || "-"}</div></div> },
    { header: "限制", render: (item) => `${item.rateLimit ?? "-"} RPM / ${item.tokenLimit ?? "-"} TPM` },
    { header: "请求数", width: "100px", render: (item) => item.totalRequests.toLocaleString("zh-CN") },
    { header: "状态", width: "90px", render: (item) => item.isActive ? "启用" : "停用" },
    { header: "最近使用", width: "160px", render: (item) => formatTableDate(item.lastUsedAt) },
  ];
  return <AdminResourceList title="API Key" description="查看用户 API Key 的脱敏信息和使用状态" searchPlaceholder="搜索用户或 Key 前缀" loadData={loadData} columns={columns} />;
}
