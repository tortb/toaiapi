"use client";

import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getInvoiceStatusLabel, getInvoiceTypeLabel, getInvoices, type InvoiceData } from "@/lib/admin-api";
import { formatTableDate, formatYuan } from "@/lib/utils";

export default function AdminInvoicesPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getInvoices(params), []);
  const columns: AdminResourceColumn<InvoiceData>[] = [
    { header: "发票号", render: (item) => <div><div className="font-mono text-xs">{item.invoiceNo}</div><div className="text-xs text-[var(--text-muted)]">{getInvoiceTypeLabel(item.type)}</div></div> },
    { header: "申请人", render: (item) => <div><div>{item.userEmail}</div><div className="text-xs text-[var(--text-muted)]">{item.applicantEmail}</div></div> },
    { header: "抬头", render: (item) => item.companyName || "个人" },
    { header: "金额", width: "120px", render: (item) => formatYuan(item.amount) },
    { header: "状态", width: "100px", render: (item) => { const status = getInvoiceStatusLabel(item.status); return <span className={status.color}>{status.label}</span>; } },
    { header: "申请时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];
  return <AdminResourceList title="发票" description="查看用户发票申请与开具状态" searchPlaceholder="搜索发票号、邮箱或抬头" loadData={loadData} columns={columns} />;
}
