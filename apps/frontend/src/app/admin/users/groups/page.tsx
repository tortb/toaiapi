"use client";

import * as React from "react";
import {
  createUserGroup,
  deleteUserGroup,
  getUserGroups,
  toggleUserGroup,
  updateUserGroup,
  type CreateUserGroupPayload,
  type UpdateUserGroupPayload,
  type UserGroupData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPagination, AdminToolbar, ConfirmDialog, StatusBadge } from "@/components/admin/data";
import { Badge, Button, Card, CardContent, EmptyState, Input, Modal, Skeleton, Table, Textarea, type TableColumn, useToast } from "@/components/ui";

interface GroupFormState {
  name: string;
  displayName: string;
  description: string;
  priceMultiplier: string;
  rpmLimit: string;
  tpmLimit: string;
  maxApiKeys: string;
}

const emptyGroupForm: GroupFormState = {
  name: "",
  displayName: "",
  description: "",
  priceMultiplier: "1.0",
  rpmLimit: "60",
  tpmLimit: "60000",
  maxApiKeys: "10",
};

function toGroupForm(group?: UserGroupData | null): GroupFormState {
  if (!group) return emptyGroupForm;
  return {
    name: group.name,
    displayName: group.displayName,
    description: group.description ?? "",
    priceMultiplier: String(group.priceMultiplier),
    rpmLimit: String(group.rpmLimit),
    tpmLimit: String(group.tpmLimit),
    maxApiKeys: String(group.maxApiKeys),
  };
}

function GroupStatus({ group }: { group: UserGroupData }) {
  if (group.isBuiltin) return <Badge variant="neutral" size="sm">内置</Badge>;
  return <StatusBadge tone={group.isActive ? "success" : "neutral"}>{group.isActive ? "启用" : "禁用"}</StatusBadge>;
}

interface GroupFormModalProps {
  group?: UserGroupData | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function GroupFormModal({ group, open, onClose, onSaved }: GroupFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(group);
  const [form, setForm] = React.useState<GroupFormState>(() => toGroupForm(group));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(toGroupForm(group));
    setError(null);
  }, [group, open]);

  const updateField = <K extends keyof GroupFormState>(key: K, value: GroupFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = (): CreateUserGroupPayload | UpdateUserGroupPayload => {
    const base = {
      displayName: form.displayName.trim(),
      description: form.description.trim() || undefined,
      priceMultiplier: Number(form.priceMultiplier),
      rpmLimit: Number.parseInt(form.rpmLimit, 10),
      tpmLimit: Number.parseInt(form.tpmLimit, 10),
      maxApiKeys: Number.parseInt(form.maxApiKeys, 10),
    };
    if (isEdit) return base;
    return { ...base, name: form.name.trim() };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (group) {
        await updateUserGroup(group.id, buildPayload());
      } else {
        await createUserGroup(buildPayload() as CreateUserGroupPayload);
      }
      toast.success(isEdit ? "用户组已更新" : "用户组已创建");
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "操作失败";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "编辑用户组" : "创建用户组"}
      description="用户组用于控制价格倍率、限流额度和 API Key 数量。"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button type="submit" form="group-form" loading={saving}>
            {isEdit ? "保存" : "创建"}
          </Button>
        </div>
      }
    >
      <form id="group-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="组名"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            disabled={isEdit}
            required
            placeholder="vip"
            className="font-mono"
          />
          <Input
            label="显示名"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            required
            placeholder="VIP 用户"
          />
        </div>

        <Textarea
          label="描述"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          placeholder="用户组描述"
        />

        <Input
          label="价格倍率"
          type="number"
          min={0.1}
          max={10}
          step={0.1}
          value={form.priceMultiplier}
          onChange={(event) => updateField("priceMultiplier", event.target.value)}
          required
          endAdornment={<span className="text-xs">x</span>}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="RPM"
            type="number"
            min={1}
            value={form.rpmLimit}
            onChange={(event) => updateField("rpmLimit", event.target.value)}
            required
          />
          <Input
            label="TPM"
            type="number"
            min={1}
            value={form.tpmLimit}
            onChange={(event) => updateField("tpmLimit", event.target.value)}
            required
          />
          <Input
            label="最大 Key 数"
            type="number"
            min={1}
            value={form.maxApiKeys}
            onChange={(event) => updateField("maxApiKeys", event.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export default function UserGroupsPage() {
  const toast = useToast();
  const [groups, setGroups] = React.useState<UserGroupData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [editingGroup, setEditingGroup] = React.useState<UserGroupData | null | undefined>(undefined);
  const [toggleTarget, setToggleTarget] = React.useState<UserGroupData | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<UserGroupData | null>(null);
  const [isMutating, setIsMutating] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchGroups = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserGroups({ page, pageSize: 20, search: search || undefined });
      setGroups(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setIsMutating(true);
    try {
      await toggleUserGroup(toggleTarget.id);
      toast.success(toggleTarget.isActive ? "用户组已禁用" : "用户组已启用");
      setToggleTarget(null);
      fetchGroups();
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
      await deleteUserGroup(deleteTarget.id);
      toast.success("用户组已删除");
      setDeleteTarget(null);
      fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setIsMutating(false);
    }
  };

  const columns = React.useMemo<TableColumn<UserGroupData>[]>(
    () => [
      {
        key: "group",
        title: "分组",
        className: "min-w-[220px]",
        render: (group) => (
          <div>
            <div className="font-medium text-neutral-950">{group.displayName}</div>
            <div className="mt-0.5 font-mono text-xs text-neutral-400">{group.name}</div>
            {group.description && <div className="mt-1 max-w-[260px] truncate text-xs text-neutral-500">{group.description}</div>}
          </div>
        ),
      },
      {
        key: "priceMultiplier",
        title: "价格倍率",
        render: (group) => <span className="font-mono text-neutral-800">{group.priceMultiplier}x</span>,
      },
      {
        key: "limits",
        title: "RPM / TPM",
        render: (group) => <span className="font-mono text-xs text-neutral-600">{group.rpmLimit} / {group.tpmLimit.toLocaleString()}</span>,
      },
      {
        key: "maxApiKeys",
        title: "最大 Key",
        render: (group) => <span className="font-mono text-neutral-700">{group.maxApiKeys}</span>,
      },
      {
        key: "userCount",
        title: "用户数",
        render: (group) => <span className="font-mono text-neutral-900">{group.userCount}</span>,
      },
      {
        key: "status",
        title: "状态",
        render: (group) => <GroupStatus group={group} />,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (group) => (
          <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingGroup(group)}>
              编辑
            </Button>
            {!group.isBuiltin && (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => setToggleTarget(group)}>
                  {group.isActive ? "禁用" : "启用"}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error-bg" onClick={() => setDeleteTarget(group)}>
                  删除
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell title="用户分组">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索组名 / 显示名"
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={fetchGroups} loading={isLoading}>刷新</Button>
            <Button type="button" onClick={() => setEditingGroup(null)}>新建分组</Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3">
          <span className="text-sm text-error">{error}</span>
          <Button type="button" variant="secondary" size="sm" onClick={fetchGroups}>重试</Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && groups.length === 0 ? (
            <Skeleton variant="table" lines={7} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={groups}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无用户组" description="创建用户组后可以配置倍率、限流和 Key 数量。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <GroupFormModal
        open={editingGroup !== undefined}
        group={editingGroup}
        onClose={() => setEditingGroup(undefined)}
        onSaved={() => {
          setEditingGroup(undefined);
          fetchGroups();
        }}
      />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={(toggleTarget?.isActive ? "禁用" : "启用") + "用户组"}
        description={toggleTarget ? "确定要" + (toggleTarget.isActive ? "禁用" : "启用") + "用户组「" + toggleTarget.displayName + "」吗？" : ""}
        confirmText={toggleTarget?.isActive ? "禁用" : "启用"}
        variant={toggleTarget?.isActive ? "danger" : "primary"}
        loading={isMutating}
        onCancel={() => setToggleTarget(null)}
        onConfirm={handleToggle}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除用户组"
        description={deleteTarget ? "确定要删除用户组「" + deleteTarget.displayName + "」吗？此操作不可撤销。" : ""}
        confirmText="删除"
        loading={isMutating}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}
