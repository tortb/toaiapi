"use client";

import * as React from "react";
import {
  deleteApiKey,
  formatDate,
  getApiKeys,
  toggleApiKey,
  type ApiKeyAdminData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPagination, AdminToolbar, ConfirmDialog, StatusBadge } from "@/components/admin/data";
import { Button, Card, CardContent, EmptyState, Select, Skeleton, Table, type TableColumn, useToast } from "@/components/ui";

const statusOptions = [
  { label: "启用", value: "active" },
  { label: "禁用", value: "inactive" },
];

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return String(value);
}

function KeyStatus({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? "success" : "neutral"}>{active ? "启用" : "禁用"}</StatusBadge>;
}

export default function ApiKeysPage() {
  const toast = useToast();
  const [apiKeys, setApiKeys] = React.useState<ApiKeyAdminData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [toggleTarget, setToggleTarget] = React.useState<ApiKeyAdminData | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiKeyAdminData | null>(null);
  const [isMutating, setIsMutating] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchApiKeys = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getApiKeys({
        page,
        pageSize: 20,
        search: search || undefined,
        isActive: statusFilter === "" ? undefined : statusFilter === "active",
      });
      setApiKeys(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  React.useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setIsMutating(true);
    try {
      await toggleApiKey(toggleTarget.id);
      toast.success(toggleTarget.isActive ? "API Key 已禁用" : "API Key 已启用");
      setToggleTarget(null);
      fetchApiKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsMutating(true);
    try {
      await deleteApiKey(deleteTarget.id);
      toast.success("API Key 已删除");
      setDeleteTarget(null);
      fetchApiKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setIsMutating(false);
    }
  };

  const columns = React.useMemo<TableColumn<ApiKeyAdminData>[]>(
    () => [
      {
        key: "key",
        title: "API Key",
        className: "min-w-[190px]",
        render: (key) => (
          <div>
            <div className="font-mono text-neutral-950">{key.keyPrefix}...</div>
            {key.name && <div className="mt-0.5 text-xs text-neutral-500">{key.name}</div>}
          </div>
        ),
      },
      {
        key: "user",
        title: "用户",
        className: "min-w-[220px]",
        render: (key) => (
          <div>
            <div className="text-neutral-950">{key.userEmail}</div>
            {key.userName && <div className="mt-0.5 text-xs text-neutral-500">{key.userName}</div>}
          </div>
        ),
      },
      {
        key: "status",
        title: "状态",
        render: (key) => <KeyStatus active={key.isActive} />,
      },
      {
        key: "totalRequests",
        title: "调用次数",
        headerClassName: "text-right",
        className: "text-right font-mono text-neutral-600",
        render: (key) => formatCompactNumber(key.totalRequests),
      },
      {
        key: "lastUsedAt",
        title: "最后使用",
        render: (key) => <span className="font-mono text-xs text-neutral-500">{key.lastUsedAt ? formatDate(key.lastUsedAt) : "从未使用"}</span>,
      },
      {
        key: "createdAt",
        title: "创建时间",
        render: (key) => <span className="font-mono text-xs text-neutral-500">{formatDate(key.createdAt)}</span>,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (key) => (
          <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setToggleTarget(key)}>
              {key.isActive ? "禁用" : "启用"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error-bg" onClick={() => setDeleteTarget(key)}>
              删除
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const toggleName = toggleTarget ? toggleTarget.name || toggleTarget.keyPrefix : "";
  const deleteName = deleteTarget ? deleteTarget.name || deleteTarget.keyPrefix : "";

  return (
    <AdminShell title="API Key 管理">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索 Key 前缀 / 名称 / 用户邮箱"
        actions={
          <Button type="button" variant="secondary" onClick={fetchApiKeys} loading={isLoading}>
            刷新
          </Button>
        }
      >
        <div className="w-full sm:w-40">
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
          <Button type="button" variant="secondary" size="sm" onClick={fetchApiKeys}>重试</Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && apiKeys.length === 0 ? (
            <Skeleton variant="table" lines={7} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={apiKeys}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无 API Key" description="没有符合当前筛选条件的 API Key。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={(toggleTarget?.isActive ? "禁用" : "启用") + " API Key"}
        description={toggleTarget ? "确定要" + (toggleTarget.isActive ? "禁用" : "启用") + " API Key「" + toggleName + "」吗？" : ""}
        confirmText={toggleTarget?.isActive ? "禁用" : "启用"}
        variant={toggleTarget?.isActive ? "danger" : "primary"}
        loading={isMutating}
        onCancel={() => setToggleTarget(null)}
        onConfirm={handleToggle}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除 API Key"
        description={deleteTarget ? "确定要删除 API Key「" + deleteName + "」吗？此操作不可撤销。" : ""}
        confirmText="删除"
        loading={isMutating}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}
