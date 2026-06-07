"use client";

import * as React from "react";
import {
  createModel,
  deleteModel,
  getModels,
  getProviders,
  updateModel,
  type ModelData,
  type ProviderData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPagination, AdminToolbar, ConfirmDialog, StatusBadge } from "@/components/admin/data";
import { ModelPricingModal, OptionalPriceText } from "@/components/admin/models/ModelPricingModal";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  Switch,
  Table,
  type TableColumn,
  useToast,
} from "@/components/ui";

interface ModelFormState {
  name: string;
  displayName: string;
  providerId: string;
  maxContext: string;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
}

const emptyModelForm: ModelFormState = {
  name: "",
  displayName: "",
  providerId: "",
  maxContext: "128000",
  supportsStreaming: true,
  supportsTools: false,
  supportsVision: false,
};

function toModelForm(model?: ModelData | null): ModelFormState {
  if (!model) return emptyModelForm;
  return {
    name: model.name,
    displayName: model.displayName,
    providerId: model.providerId,
    maxContext: String(model.maxContext),
    supportsStreaming: model.supportsStreaming,
    supportsTools: model.supportsTools,
    supportsVision: model.supportsVision,
  };
}

function formatContext(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return String(value);
}

function ModelStatus({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? "success" : "neutral"}>{active ? "上架中" : "已下架"}</StatusBadge>;
}

function CapabilityBadge({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <Badge variant={active ? "info" : "neutral"} size="sm" className={!active ? "text-neutral-400" : undefined}>
      {children}
    </Badge>
  );
}

interface ModelFormModalProps {
  model?: ModelData | null;
  providers: ProviderData[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function ModelFormModal({ model, providers, open, onClose, onSaved }: ModelFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(model);
  const [form, setForm] = React.useState<ModelFormState>(() => toModelForm(model));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(toModelForm(model));
    setError(null);
  }, [model, open]);

  const updateField = <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (model) {
        await updateModel(model.id, {
          displayName: form.displayName,
          maxContext: Number(form.maxContext),
          supportsStreaming: form.supportsStreaming,
          supportsTools: form.supportsTools,
          supportsVision: form.supportsVision,
        });
      } else {
        await createModel({
          name: form.name,
          displayName: form.displayName,
          providerId: form.providerId,
          maxContext: Number(form.maxContext),
          supportsStreaming: form.supportsStreaming,
          supportsTools: form.supportsTools,
          supportsVision: form.supportsVision,
        });
      }
      toast.success(isEdit ? "模型已更新" : "模型已创建");
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
      title={isEdit ? "编辑模型" : "新建模型"}
      description="模型用于控制前台可用能力、上下文长度和后续定价。"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button type="submit" form="model-form" loading={saving}>
            保存
          </Button>
        </div>
      }
    >
      <form id="model-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}

        {!isEdit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="模型标识"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="gpt-4o"
              required
              maxLength={100}
              className="font-mono"
            />
            <Select
              label="服务商"
              value={form.providerId}
              onChange={(event) => updateField("providerId", event.target.value)}
              placeholder="请选择服务商"
              required
              options={providers.map((provider) => ({ label: provider.displayName + " (" + provider.name + ")", value: provider.id }))}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="显示名称"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="GPT-4o"
            required
            maxLength={200}
          />
          <Input
            label="上下文长度"
            type="number"
            value={form.maxContext}
            onChange={(event) => updateField("maxContext", event.target.value)}
            min={1}
            required
            endAdornment={<span className="text-xs">tokens</span>}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-sm font-medium text-neutral-800">流式输出</span>
            <Switch checked={form.supportsStreaming} onCheckedChange={(checked) => updateField("supportsStreaming", checked)} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-sm font-medium text-neutral-800">工具调用</span>
            <Switch checked={form.supportsTools} onCheckedChange={(checked) => updateField("supportsTools", checked)} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-sm font-medium text-neutral-800">视觉输入</span>
            <Switch checked={form.supportsVision} onCheckedChange={(checked) => updateField("supportsVision", checked)} />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function ModelsPage() {
  const toast = useToast();
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [formModel, setFormModel] = React.useState<ModelData | null | undefined>(undefined);
  const [pricingModel, setPricingModel] = React.useState<ModelData | null>(null);
  const [toggleModel, setToggleModel] = React.useState<ModelData | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ModelData | null>(null);
  const [isMutating, setIsMutating] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    let mounted = true;
    getProviders({ pageSize: 100 })
      .then((res) => {
        if (mounted) setProviders(res.items);
      })
      .catch(() => {
        if (mounted) setProviders([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const fetchModels = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getModels({ page, pageSize: 20, search: search || undefined });
      setModels(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const providerMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of providers) map.set(provider.id, provider.displayName);
    return map;
  }, [providers]);

  const handleToggleStatus = async () => {
    if (!toggleModel) return;
    setIsMutating(true);
    try {
      await updateModel(toggleModel.id, { isActive: !toggleModel.isActive });
      toast.success(toggleModel.isActive ? "模型已下架" : "模型已上架");
      setToggleModel(null);
      fetchModels();
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
      await deleteModel(deleteTarget.id);
      toast.success("模型已删除");
      setDeleteTarget(null);
      fetchModels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setIsMutating(false);
    }
  };

  const columns = React.useMemo<TableColumn<ModelData>[]>(
    () => [
      {
        key: "model",
        title: "模型",
        className: "min-w-[230px]",
        render: (model) => (
          <div>
            <div className="font-medium text-neutral-950">{model.displayName}</div>
            <div className="mt-0.5 font-mono text-xs text-neutral-400">{model.name}</div>
          </div>
        ),
      },
      {
        key: "provider",
        title: "服务商",
        render: (model) => <span className="text-neutral-600">{providerMap.get(model.providerId) ?? model.providerId}</span>,
      },
      {
        key: "context",
        title: "上下文",
        headerClassName: "text-right",
        className: "text-right font-mono text-neutral-600",
        render: (model) => formatContext(model.maxContext),
      },
      {
        key: "capabilities",
        title: "能力",
        className: "min-w-[170px]",
        render: (model) => (
          <div className="flex flex-wrap gap-1">
            <CapabilityBadge active={model.supportsStreaming}>流式</CapabilityBadge>
            <CapabilityBadge active={model.supportsTools}>工具</CapabilityBadge>
            <CapabilityBadge active={model.supportsVision}>视觉</CapabilityBadge>
          </div>
        ),
      },
      {
        key: "inputPrice",
        title: "输入价",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (model) => <OptionalPriceText value={model.pricing?.inputPrice} muted />,
      },
      {
        key: "outputPrice",
        title: "输出价",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (model) => <OptionalPriceText value={model.pricing?.outputPrice} muted />,
      },
      {
        key: "status",
        title: "状态",
        render: (model) => <ModelStatus active={model.isActive} />,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (model) => (
          <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPricingModel(model)}>
              定价
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setToggleModel(model)}>
              {model.isActive ? "下架" : "上架"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormModel(model)}>
              编辑
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error-bg" onClick={() => setDeleteTarget(model)}>
              删除
            </Button>
          </div>
        ),
      },
    ],
    [providerMap],
  );

  return (
    <AdminShell title="模型管理">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索模型"
        actions={
          <Button type="button" onClick={() => setFormModel(null)}>
            新建模型
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3">
          <span className="text-sm text-error">{error}</span>
          <Button type="button" variant="secondary" size="sm" onClick={fetchModels}>
            重试
          </Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && models.length === 0 ? (
            <Skeleton variant="table" lines={7} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={models}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无模型" description="新建模型后即可配置能力、状态和定价。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ModelFormModal
        open={formModel !== undefined}
        model={formModel}
        providers={providers}
        onClose={() => setFormModel(undefined)}
        onSaved={() => {
          setFormModel(undefined);
          fetchModels();
        }}
      />

      <ModelPricingModal
        open={Boolean(pricingModel)}
        model={pricingModel}
        onClose={() => setPricingModel(null)}
        onSaved={() => {
          setPricingModel(null);
          fetchModels();
        }}
      />

      <ConfirmDialog
        open={Boolean(toggleModel)}
        title={toggleModel?.isActive ? "下架模型" : "上架模型"}
        description={
          toggleModel
            ? (toggleModel.isActive
                ? "确定要下架模型「" + toggleModel.displayName + "」吗？下架后用户将无法使用该模型。"
                : "确定要上架模型「" + toggleModel.displayName + "」吗？")
            : ""
        }
        confirmText={toggleModel?.isActive ? "下架" : "上架"}
        variant={toggleModel?.isActive ? "danger" : "primary"}
        loading={isMutating}
        onCancel={() => setToggleModel(null)}
        onConfirm={handleToggleStatus}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除模型"
        description={deleteTarget ? "确定要删除模型「" + deleteTarget.displayName + "」吗？此操作不可撤销。" : ""}
        confirmText="删除"
        loading={isMutating}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}
