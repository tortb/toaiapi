"use client";

import Link from "next/link";
import * as React from "react";
import {
  formatDate,
  getRoleLabel,
  getUserStatusLabel,
  getUsers,
  updateUserStatus,
  type UserData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPagination, AdminToolbar, ConfirmDialog, StatusBadge } from "@/components/admin/data";
import { Badge, Button, Card, CardContent, EmptyState, Select, Skeleton, Table, type TableColumn, useToast } from "@/components/ui";

const roleOptions = [
  { label: "普通用户", value: "USER" },
  { label: "VIP", value: "VIP" },
  { label: "企业", value: "ENTERPRISE" },
  { label: "代理", value: "AGENT" },
  { label: "管理员", value: "ADMIN" },
  { label: "超级管理员", value: "SUPER_ADMIN" },
];

const statusOptions = [
  { label: "正常", value: "ACTIVE" },
  { label: "已冻结", value: "SUSPENDED" },
  { label: "已封禁", value: "BANNED" },
];

function statusTone(status: string) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "SUSPENDED") return "warning" as const;
  if (status === "BANNED") return "error" as const;
  return "neutral" as const;
}

function UserStatus({ status }: { status: string }) {
  const meta = getUserStatusLabel(status);
  return <StatusBadge tone={statusTone(status)}>{meta.label}</StatusBadge>;
}

function RoleBadge({ role }: { role: string }) {
  const meta = getRoleLabel(role);
  const tone = role.includes("ADMIN") ? "purple" : role === "ENTERPRISE" ? "info" : role === "VIP" ? "warning" : "neutral";
  return <Badge variant={tone} size="sm">{meta.label}</Badge>;
}

function initials(user: UserData) {
  return (user.displayName || user.email || "U").slice(0, 1).toUpperCase();
}

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [statusTarget, setStatusTarget] = React.useState<{ user: UserData; status: "ACTIVE" | "SUSPENDED" | "BANNED" } | null>(null);
  const [isMutating, setIsMutating] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUsers({
        page,
        pageSize: 20,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setUsers(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    setIsMutating(true);
    try {
      await updateUserStatus(statusTarget.user.id, statusTarget.status);
      toast.success("用户状态已更新");
      setStatusTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setIsMutating(false);
    }
  };

  const columns = React.useMemo<TableColumn<UserData>[]>(
    () => [
      {
        key: "user",
        title: "用户",
        className: "min-w-[220px]",
        render: (user) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
              {initials(user)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-neutral-950">{user.displayName || "-"}</div>
              <div className="mt-0.5 font-mono text-xs text-neutral-400">{user.id.slice(0, 8)}...</div>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        title: "邮箱",
        className: "min-w-[220px]",
        render: (user) => <span className="text-neutral-700">{user.email}</span>,
      },
      {
        key: "role",
        title: "角色",
        render: (user) => <RoleBadge role={user.role} />,
      },
      {
        key: "status",
        title: "状态",
        render: (user) => <UserStatus status={user.status} />,
      },
      {
        key: "createdAt",
        title: "注册时间",
        render: (user) => <span className="font-mono text-xs text-neutral-500">{formatDate(user.createdAt)}</span>,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (user) => (
          <div className="flex items-center justify-end gap-1">
            <Link className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950" href={"/admin/users/" + user.id}>
              详情
            </Link>
            {user.status === "ACTIVE" ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setStatusTarget({ user, status: "SUSPENDED" })}>
                冻结
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={() => setStatusTarget({ user, status: "ACTIVE" })}>
                解冻
              </Button>
            )}
            {user.status !== "BANNED" && (
              <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error-bg" onClick={() => setStatusTarget({ user, status: "BANNED" })}>
                封禁
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const statusLabel = statusTarget?.status === "ACTIVE" ? "解冻/解封" : statusTarget?.status === "SUSPENDED" ? "冻结" : "封禁";
  const statusName = statusTarget ? statusTarget.user.displayName || statusTarget.user.email : "";

  return (
    <AdminShell title="用户列表">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索 ID / 用户名 / 邮箱"
        actions={
          <Button type="button" variant="secondary" onClick={fetchUsers} loading={isLoading}>
            刷新
          </Button>
        }
      >
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
          <Select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            placeholder="所有角色"
            options={roleOptions}
          />
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            placeholder="所有状态"
            options={statusOptions}
          />
        </div>
      </AdminToolbar>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3">
          <span className="text-sm text-error">{error}</span>
          <Button type="button" variant="secondary" size="sm" onClick={fetchUsers}>重试</Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && users.length === 0 ? (
            <Skeleton variant="table" lines={7} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={users}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无用户" description="没有符合当前筛选条件的用户。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={"确认" + statusLabel + "用户"}
        description={statusTarget ? "确定要" + statusLabel + "用户「" + statusName + "」吗？" : ""}
        confirmText={statusLabel}
        variant={statusTarget?.status === "ACTIVE" ? "primary" : "danger"}
        loading={isMutating}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusChange}
      />
    </AdminShell>
  );
}
