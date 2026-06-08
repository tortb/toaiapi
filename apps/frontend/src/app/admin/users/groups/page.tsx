"use client";

import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getUserGroups, type UserGroupData } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";

export default function AdminUserGroupsPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getUserGroups(params), []);
  const columns: AdminResourceColumn<UserGroupData>[] = [
    { header: "组名", render: (item) => <div><div className="font-medium">{item.displayName}</div><div className="text-xs text-[var(--text-muted)]">{item.name}</div></div> },
    { header: "倍率", width: "90px", render: (item) => String(item.priceMultiplier) },
    { header: "限制", render: (item) => `${item.rpmLimit} RPM / ${item.tpmLimit} TPM / ${item.maxApiKeys} Keys` },
    { header: "用户数", width: "90px", render: (item) => item.userCount.toLocaleString("zh-CN") },
    { header: "状态", width: "90px", render: (item) => item.isActive ? "启用" : "停用" },
    { header: "创建时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];
  return <AdminResourceList title="用户分组" description="查看用户组价格倍率和资源限制" searchPlaceholder="搜索组名" loadData={loadData} columns={columns} />;
}
