"use client";

import * as React from "react";
import {
  createChannel,
  deleteChannel,
  disableChannel,
  enableChannel,
  formatNumber,
  getChannels,
  getChannelStatusLabel,
  getProviders,
  testChannel,
  updateChannel,
  type ChannelData,
  type ChannelTestResult,
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
  Select,
  Skeleton,
  Table,
  type TableColumn,
  useToast,
} from "@/components/ui";

interface ChannelFormState {
  providerId: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  weight: string;
  priority: string;
}

const emptyChannelForm: ChannelFormState = {
  providerId: "",
  name: "",
  baseUrl: "",
  apiKey: "",
  weight: "1",
  priority: "0",
};

function toChannelForm(channel?: ChannelData | null): ChannelFormState {
  if (!channel) return emptyChannelForm;
  return {
    providerId: channel.providerId,
    name: channel.name,
    baseUrl: channel.baseUrl,
    apiKey: "",
    weight: String(channel.weight),
    priority: String(channel.priority),
  };
}

function calcSuccessRate(channel: ChannelData): string {
  if (channel.totalRequests === 0) return "-";
  const rate = ((channel.totalRequests - channel.failedRequests) / channel.totalRequests) * 100;
  return rate.toFixed(1) + "%";
}

function channelTone(status: string) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "RATE_LIMITED") return "warning" as const;
  if (status === "ERROR") return "error" as const;
  return "neutral" as const;
}

function ChannelStatus({ status }: { status: string }) {
  const meta = getChannelStatusLabel(status);
  return <StatusBadge tone={channelTone(status)}>{meta.label}</StatusBadge>;
}

interface ChannelFormModalProps {
  channel?: ChannelData | null;
  providers: ProviderData[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function ChannelFormModal({ channel, providers, open, onClose, onSaved }: ChannelFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(channel);
  const [form, setForm] = React.useState<ChannelFormState>(() => toChannelForm(channel));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(toChannelForm(channel));
    setError(null);
  }, [channel, open]);

  const updateField = <K extends keyof ChannelFormState>(key: K, value: ChannelFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find((item) => item.id === providerId);
    setForm((prev) => ({
      ...prev,
      providerId,
      baseUrl: !isEdit && provider ? provider.baseUrl : prev.baseUrl,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (channel) {
        const payload: { name: string; baseUrl: string; weight: number; priority: number; apiKey?: string } = {
          name: form.name,
          baseUrl: form.baseUrl,
          weight: Number(form.weight),
          priority: Number(form.priority),
        };
        if (form.apiKey.trim()) payload.apiKey = form.apiKey.trim();
        await updateChannel(channel.id, payload);
      } else {
        await createChannel({
          providerId: form.providerId,
          name: form.name,
          baseUrl: form.baseUrl,
          apiKey: form.apiKey,
          weight: Number(form.weight),
          priority: Number(form.priority),
        });
      }
      toast.success(isEdit ? "渠道已更新" : "渠道已创建");
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
      title={isEdit ? "编辑渠道" : "新建渠道"}
      description="渠道承载实际 API 请求，权重与优先级会影响分发顺序。"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button type="submit" form="channel-form" loading={saving}>
            保存
          </Button>
        </div>
      }
    >
      <form id="channel-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="服务商"
            value={form.providerId}
            onChange={(event) => handleProviderChange(event.target.value)}
            placeholder="请选择服务商"
            required
            disabled={isEdit}
            options={providers.map((provider) => ({ label: provider.displayName + " (" + provider.name + ")", value: provider.id }))}
          />
          <Input
            label="渠道名称"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="OpenAI 主力渠道"
            required
            maxLength={100}
          />
        </div>

        <Input
          label="Base URL"
          type="url"
          value={form.baseUrl}
          onChange={(event) => updateField("baseUrl", event.target.value)}
          placeholder="https://api.openai.com"
          required
          className="font-mono"
        />

        <Input
          label="API Key"
          type="password"
          value={form.apiKey}
          onChange={(event) => updateField("apiKey", event.target.value)}
          placeholder={isEdit ? "留空则不更新" : "sk-..."}
          required={!isEdit}
          className="font-mono"
          hint={isEdit && channel?.keyPrefix ? "当前 Key 前缀：" + channel.keyPrefix : undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="权重"
            type="number"
            min={1}
            max={100}
            value={form.weight}
            onChange={(event) => updateField("weight", event.target.value)}
          />
          <Input
            label="优先级"
            type="number"
            min={0}
            max={100}
            value={form.priority}
            onChange={(event) => updateField("priority", event.target.value)}
            hint="数字越小优先级越高。"
          />
        </div>
      </form>
    </Modal>
  );
}

function TestResultModal({ result, channelName, open, onClose }: { result: ChannelTestResult | null; channelName: string; open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="连通性测试结果"
      description={channelName}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>关闭</Button>
        </div>
      }
    >
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-500">状态</span>
            <StatusBadge tone={result.success ? "success" : "error"}>{result.success ? "连接成功" : "连接失败"}</StatusBadge>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">延迟</span>
              <span className="font-mono text-neutral-900">{result.latencyMs}ms</span>
            </div>
            <div className="grid gap-1">
              <span className="text-neutral-500">消息</span>
              <div className="break-words rounded-lg bg-neutral-50 px-3 py-2 text-neutral-800">{result.message}</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function ChannelsPage() {
  const toast = useToast();
  const [channels, setChannels] = React.useState<ChannelData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterProvider, setFilterProvider] = React.useState("");
  const [formChannel, setFormChannel] = React.useState<ChannelData | null | undefined>(undefined);
  const [toggleTarget, setToggleTarget] = React.useState<ChannelData | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ChannelData | null>(null);
  const [testResult, setTestResult] = React.useState<{ result: ChannelTestResult; name: string } | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);
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

  const fetchChannels = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getChannels({
        page,
        pageSize: 20,
        search: search || undefined,
        providerId: filterProvider || undefined,
      });
      setChannels(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [filterProvider, page, search]);

  React.useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleTest = async (channel: ChannelData) => {
    setTestingId(channel.id);
    try {
      const result = await testChannel(channel.id);
      setTestResult({ result, name: channel.name });
    } catch (err) {
      setTestResult({
        result: { success: false, latencyMs: 0, message: err instanceof Error ? err.message : "测试失败" },
        name: channel.name,
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setIsMutating(true);
    try {
      if (toggleTarget.isActive) {
        await disableChannel(toggleTarget.id);
        toast.success("渠道已禁用");
      } else {
        await enableChannel(toggleTarget.id);
        toast.success("渠道已启用");
      }
      setToggleTarget(null);
      fetchChannels();
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
      await deleteChannel(deleteTarget.id);
      toast.success("渠道已删除");
      setDeleteTarget(null);
      fetchChannels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setIsMutating(false);
    }
  };

  const columns = React.useMemo<TableColumn<ChannelData>[]>(
    () => [
      {
        key: "name",
        title: "渠道",
        className: "min-w-[180px]",
        render: (channel) => (
          <div>
            <div className="font-medium text-neutral-950">{channel.name}</div>
            <div className="mt-0.5 font-mono text-xs text-neutral-400">{channel.keyPrefix || "-"}</div>
          </div>
        ),
      },
      {
        key: "provider",
        title: "服务商",
        render: (channel) => <span className="text-neutral-600">{channel.provider?.displayName ?? "-"}</span>,
      },
      {
        key: "baseUrl",
        title: "Base URL",
        className: "max-w-[240px]",
        render: (channel) => (
          <span className="block truncate font-mono text-xs text-neutral-500" title={channel.baseUrl}>{channel.baseUrl}</span>
        ),
      },
      {
        key: "status",
        title: "状态",
        render: (channel) => <ChannelStatus status={channel.status} />,
      },
      {
        key: "requests",
        title: "请求数",
        headerClassName: "text-right",
        className: "text-right font-mono text-neutral-600",
        render: (channel) => formatNumber(channel.totalRequests),
      },
      {
        key: "successRate",
        title: "成功率",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (channel) => {
          const successRate = calcSuccessRate(channel);
          const risky = successRate !== "-" && Number.parseFloat(successRate) < 95;
          return <span className={risky ? "text-error" : "text-neutral-700"}>{successRate}</span>;
        },
      },
      {
        key: "latency",
        title: "延迟",
        headerClassName: "text-right",
        className: "text-right font-mono text-neutral-600",
        render: (channel) => (channel.avgLatencyMs > 0 ? channel.avgLatencyMs + "ms" : "-"),
      },
      {
        key: "routing",
        title: "权重/优先级",
        headerClassName: "text-right",
        className: "text-right font-mono text-neutral-600",
        render: (channel) => channel.weight + "/" + channel.priority,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (channel) => {
          const isTesting = testingId === channel.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button type="button" variant="ghost" size="sm" loading={isTesting} onClick={() => handleTest(channel)}>
                测试
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setToggleTarget(channel)}>
                {channel.isActive ? "禁用" : "启用"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setFormChannel(channel)}>
                编辑
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error-bg" onClick={() => setDeleteTarget(channel)}>
                删除
              </Button>
            </div>
          );
        },
      },
    ],
    [testingId],
  );

  return (
    <AdminShell title="通道管理">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索渠道"
        actions={
          <Button type="button" onClick={() => setFormChannel(null)}>
            新建渠道
          </Button>
        }
      >
        <div className="w-full sm:w-56">
          <Select
            value={filterProvider}
            onChange={(event) => {
              setFilterProvider(event.target.value);
              setPage(1);
            }}
            placeholder="全部服务商"
            options={providers.map((provider) => ({ label: provider.displayName, value: provider.id }))}
          />
        </div>
      </AdminToolbar>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3">
          <span className="text-sm text-error">{error}</span>
          <Button type="button" variant="secondary" size="sm" onClick={fetchChannels}>
            重试
          </Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && channels.length === 0 ? (
            <Skeleton variant="table" lines={7} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={channels}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无渠道" description="新建渠道后即可接入服务商 API 并参与请求分发。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ChannelFormModal
        open={formChannel !== undefined}
        channel={formChannel}
        providers={providers}
        onClose={() => setFormChannel(undefined)}
        onSaved={() => {
          setFormChannel(undefined);
          fetchChannels();
        }}
      />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? "禁用渠道" : "启用渠道"}
        description={
          toggleTarget
            ? (toggleTarget.isActive
                ? "确定要禁用渠道「" + toggleTarget.name + "」吗？禁用后该渠道将不再参与请求分发。"
                : "确定要启用渠道「" + toggleTarget.name + "」吗？")
            : ""
        }
        confirmText={toggleTarget?.isActive ? "禁用" : "启用"}
        variant={toggleTarget?.isActive ? "danger" : "primary"}
        loading={isMutating}
        onCancel={() => setToggleTarget(null)}
        onConfirm={handleToggle}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除渠道"
        description={deleteTarget ? "确定要删除渠道「" + deleteTarget.name + "」吗？删除后不可恢复。" : ""}
        confirmText="删除"
        loading={isMutating}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <TestResultModal
        open={Boolean(testResult)}
        result={testResult?.result ?? null}
        channelName={testResult?.name ?? ""}
        onClose={() => setTestResult(null)}
      />
    </AdminShell>
  );
}
