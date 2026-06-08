"use client";

import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getBills, getTransactionTypeLabel, type BillAdminData } from "@/lib/admin-api";
import { formatTableDate, formatYuan } from "@/lib/utils";

export default function AdminBillsPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getBills(params), []);
  const columns: AdminResourceColumn<BillAdminData>[] = [
    { header: "用户", render: (item) => <div><div>{item.userEmail}</div><div className="text-xs text-[var(--text-muted)]">{item.userName || "-"}</div></div> },
    { header: "类型", width: "100px", render: (item) => { const type = getTransactionTypeLabel(item.type); return <span className={`inline-flex rounded px-2 py-0.5 text-xs ${type.color}`}>{type.label}</span>; } },
    { header: "金额", width: "120px", render: (item) => formatYuan(item.amount) },
    { header: "余额", width: "120px", render: (item) => formatYuan(item.balanceAfter) },
    { header: "备注", render: (item) => item.remark || "-" },
    { header: "时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];
  return <AdminResourceList title="账单" description="查看平台用户余额交易流水" searchPlaceholder="搜索用户邮箱或备注" loadData={loadData} columns={columns} />;
}
