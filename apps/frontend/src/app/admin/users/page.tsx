"use client";

import Link from "next/link";
import { useCallback } from "react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { getRoleLabel, getUsers, getUserStatusLabel, type UserData } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getUsers(params), []);
  const columns: AdminResourceColumn<UserData>[] = [
    { header: "邮箱", render: (item) => <div><Link href={`/admin/users/${item.id}`} className="font-medium text-[var(--accent)] hover:underline">{item.email}</Link><div className="text-xs text-[var(--text-muted)]">{item.displayName || "-"}</div></div> },
    { header: "角色", width: "120px", render: (item) => { const role = getRoleLabel(item.role); return <span className={`inline-flex rounded px-2 py-0.5 text-xs ${role.color}`}>{role.label}</span>; } },
    { header: "状态", width: "110px", render: (item) => { const status = getUserStatusLabel(item.status); return <span className={status.color}>{status.label}</span>; } },
    { header: "注册时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];
  return <AdminResourceList title="用户管理" description="查看平台用户、角色和账户状态" searchPlaceholder="搜索邮箱、名称或 ID" loadData={loadData} columns={columns} />;
}
