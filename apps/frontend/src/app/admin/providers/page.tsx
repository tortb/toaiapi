"use client";

import * as React from "react";
import {
  createProvider,
  deleteProvider,
  formatDate,
  getProviders,
  updateProvider,
  type ProviderData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPagination, AdminToolbar, ConfirmDialog, StatusBadge } from "@/components/admin/data";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Switch,
  Table,
  type TableColumn,
  useToast,
} from "@/components/ui";

type ProviderFormState = {
  name: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
};

const emptyProviderForm: ProviderFormState = {
  name: "",
  displayName: "",
  baseUrl: "",
  isActive: true,
};

function toProviderForm(provider?: ProviderData | null): ProviderFormState {
  if (!provider) return emptyProviderForm;
  return {
    name: provider.name,
    displayName: provider.displayName,
    baseUrl: provider.baseUrl,
    isActive: provider.isActive,
  };
}

function ProviderStatus({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? "success" : "neutral"}>{active ? "启用" : "禁用"}</StatusBadge>;
}

interface ProviderFormModalProps {
  provider?: ProviderData | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function ProviderFormModal({ provider, open, onClose, onSaved }: ProviderFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(provider);
  const [form, setForm] = React.useState<ProviderFormState>(() => toProviderForm(provider));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(toProviderForm(provider));
    setError(null);
  }, [open, provider]);

  const updateField = <K extends keyof ProviderFormState>(key: K, value: ProviderFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (provider) {
        await updateProvider(provider.id, {
          displayName: form.displayName,
          baseUrl: form.baseUrl,
          isActive: form.isActive,
        });
      } else {
        await createProvider({
          name: form.name,
          displayName: form.displayName,
          baseUrl: form.baseUrl,
          isActive: form.isActive,
        });
      }
      toast.success(isEdit ? "服务商已更新" : "服务商已创建");
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
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
      title={isEdit ? "编辑服务商" : "新建服务商"}
      description="服务商用于归类模型与渠道，同一服务商可以绑定多个渠道。"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button type="submit" form="provider-form" loading={saving}>
            保存
          </Button>
        </div>
      }
    >
      <form id="provider-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}

        {!isEdit && (
          <Input
            label="标识名"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="openai"
            required
            maxLength={50}
            className="font-mono"
          />
        )}

        <Input
          label="显示名称"
          value={form.displayName}
          onChange={(event) => updateField("displayName", event.target.value)}
          placeholder="OpenAI"
          required
          maxLength={100}
        />

        <Input
          label="Base URL"
          type="url"
          value={form.baseUrl}
          onChange={(event) => updateField("baseUrl", event.target.value)}
          placeholder="https://api.openai.com"
          required
          className="font-mono"
        />

        <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-neutral-900">启用服务商</div>
            <div className="mt-1 text-sm text-neutral-500">禁用后不会再作为模型与渠道的可用来源。</div>
          </div>
          <Switch checked={form.isActive} onCheckedChange={(checked) => updateField("isActive", checked)} />
        </div>
      </form>
    </Modal>
  );
}

export default function ProvidersPage() {
  const toast = useToast();
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [formProvider, setFormProvider] = React.useState<ProviderData | null | undefined>(undefined);
  const [deletingProvider, setDeletingProvider] = React.useState<ProviderData | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchProviders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProviders({ page, pageSize: 20, search: search || undefined });
      setProviders(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleDelete = async () => {
    if (!deletingProvider) return;
    setIsDeleting(true);
    try {
      await deleteProvider(deletingProvider.id);
      toast.success("服务商已删除");
      setDeletingProvider(null);
      fetchProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = React.useMemo<TableColumn<ProviderData>[]>(
    () => [
      {
        key: "name",
        title: "标识名",
        className: "font-mono text-neutral-900",
        render: (provider) => provider.name,
      },
      {
        key: "displayName",
        title: "显示名称",
        render: (provider) => <span className="font-medium text-neutral-950">{provider.displayName}</span>,
      },
      {
        key: "baseUrl",
        title: "Base URL",
        className: "max-w-[280px]",
        render: (provider) => (
          <span className="block truncate font-mono text-xs text-neutral-500" title={provider.baseUrl}>
            {provider.baseUrl}
          </span>
        ),
      },
      {
        key: "status",
        title: "状态",
        render: (provider) => <ProviderStatus active={provider.isActive} />,
      },
      {
        key: "channelCount",
        title: "渠道数",
        render: (provider) => <span className="font-mono text-neutral-700">{provider.channelCount}</span>,
      },
      {
        key: "createdAt",
        title: "创建时间",
        render: (provider) => <span className="font-mono text-xs text-neutral-500">{formatDate(provider.createdAt)}</span>,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (provider) => (
          <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormProvider(provider)}>
              编辑
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error-bg" onClick={() => setDeletingProvider(provider)}>
              删除
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell title="服务商管理">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索服务商"
        actions={
          <Button type="button" onClick={() => setFormProvider(null)}>
            新建服务商
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3">
          <span className="text-sm text-error">{error}</span>
          <Button type="button" variant="secondary" size="sm" onClick={fetchProviders}>
            重试
          </Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && providers.length === 0 ? (
            <Skeleton variant="table" lines={6} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={providers}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无服务商" description="创建服务商后即可绑定模型和渠道。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ProviderFormModal
        open={formProvider !== undefined}
        provider={formProvider}
        onClose={() => setFormProvider(undefined)}
        onSaved={() => {
          setFormProvider(undefined);
          fetchProviders();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingProvider)}
        title="删除服务商"
        description={
          deletingProvider
            ? "确定要删除服务商「" + deletingProvider.displayName + "」吗？如果该服务商下有关联渠道，删除将被拒绝。"
            : ""
        }
        confirmText="删除"
        loading={isDeleting}
        onCancel={() => setDeletingProvider(null)}
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}
