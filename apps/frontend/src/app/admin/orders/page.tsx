"use client";

import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getOrders, getOrderStatusLabel, getPaymentMethodLabel, type OrderAdminData } from "@/lib/admin-api";
import { formatTableDate, formatYuan } from "@/lib/utils";

export default function AdminOrdersPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getOrders(params), []);
  const columns: AdminResourceColumn<OrderAdminData>[] = [
    { header: "订单号", render: (item) => <span className="font-mono text-xs">{item.orderNo}</span> },
    { header: "用户", render: (item) => <div><div>{item.userEmail}</div><div className="text-xs text-[var(--text-muted)]">{item.userName || "-"}</div></div> },
    { header: "金额", width: "110px", render: (item) => formatYuan(item.amount) },
    { header: "支付方式", width: "140px", render: (item) => getPaymentMethodLabel(item.paymentMethod) },
    { header: "状态", width: "100px", render: (item) => { const status = getOrderStatusLabel(item.status); return <span className={status.color}>{status.label}</span>; } },
    { header: "创建时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];
  return <AdminResourceList title="订单" description="查看充值订单和支付状态" searchPlaceholder="搜索订单、商品或用户邮箱" loadData={loadData} columns={columns} />;
}
