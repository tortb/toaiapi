"use client";

/**
 * 渠道管理页
 *
 * Channel CRUD + 启用/禁用 + 测试连通性。
 * 后端 API：GET/POST/PATCH/DELETE /admin/channels, POST /admin/channels/:id/test
 */

import * as React from "react";
import {
  getChannels,
  createChannel,
  updateChannel,
  enableChannel,
  disableChannel,
  deleteChannel,
  testChannel,
  getProviders,
  formatDate,
  formatNumber,
  getChannelStatusLabel,
  type ChannelData,
  type ProviderData,
  type ChannelTestResult,
  type CreateChannelPayload,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 确认弹窗 ============== */
interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  confirmColor?: string;
}

function ConfirmModal({
  action,
  onClose,
}: {
  action: ConfirmAction;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">{action.title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{action.message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => {
              action.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm text-white rounded-lg ${action.confirmColor ?? "bg-red-600 hover:bg-red-700"}`}
          >
            {action.confirmText ?? "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 测试结果弹窗 ============== */
function TestResultModal({
  result,
  channelName,
  onClose,
}: {
  result: ChannelTestResult;
  channelName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">连通性测试结果</h3>
        </div>
        <div className="px-6 py-6">
          <div className="text-center mb-4">
            {result.success ? (
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✓</span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✗</span>
              </div>
            )}
            <p className={`text-lg font-medium ${result.success ? "text-success" : "text-red-600"}`}>
              {result.success ? "连接成功" : "连接失败"}
            </p>
          </div>
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">渠道</span>
              <span className="text-gray-800 font-medium">{channelName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">延迟</span>
              <span className="text-gray-800 font-mono">{result.latencyMs}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">消息</span>
              <span className={`text-right max-w-[240px] truncate ${result.success ? "text-gray-800" : "text-red-600"}`}>
                {result.message}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-600"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 新建/编辑弹窗 ============== */
interface ChannelFormProps {
  channel?: ChannelData | null;
  providers: ProviderData[];
  onClose: () => void;
  onSaved: () => void;
}

function ChannelFormModal({ channel, providers, onClose, onSaved }: ChannelFormProps) {
  const [providerId, setProviderId] = React.useState(channel?.providerId ?? "");
  const [name, setName] = React.useState(channel?.name ?? "");
  const [baseUrl, setBaseUrl] = React.useState(channel?.baseUrl ?? "");
  const [apiKey, setApiKey] = React.useState("");
  const [weight, setWeight] = React.useState(String(channel?.weight ?? 1));
  const [priority, setPriority] = React.useState(String(channel?.priority ?? 0));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = !!channel;

  // 选择 Provider 时自动填充 baseUrl
  const handleProviderChange = (pid: string) => {
    setProviderId(pid);
    const p = providers.find((x) => x.id === pid);
    if (p && !isEdit) {
      setBaseUrl(p.baseUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && channel) {
        const payload: Record<string, unknown> = { name, baseUrl, weight: Number(weight), priority: Number(priority) };
        if (apiKey) payload.apiKey = apiKey;
        await updateChannel(channel.id, payload);
      } else {
        await createChannel({
          providerId,
          name,
          baseUrl,
          apiKey,
          weight: Number(weight),
          priority: Number(priority),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">
            {isEdit ? "编辑渠道" : "新建渠道"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                服务商 <span className="text-red-500">*</span>
              </label>
              <select
                value={providerId}
                onChange={(e) => handleProviderChange(e.target.value)}
                required
                disabled={isEdit}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
              >
                <option value="">请选择服务商</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} ({p.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                渠道名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：OpenAI 主力渠道"
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key {isEdit ? "" : <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isEdit ? "留空则不更新" : "sk-..."}
                required={!isEdit}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
              {isEdit && (
                <p className="mt-1 text-xs text-gray-400">当前 Key：{channel?.keyPrefix}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">权重</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="mt-1 text-xs text-gray-400">数字越小优先级越高</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============== 计算成功率 ============== */
function calcSuccessRate(ch: ChannelData): string {
  if (ch.totalRequests === 0) return "-";
  const rate = ((ch.totalRequests - ch.failedRequests) / ch.totalRequests) * 100;
  return `${rate.toFixed(1)}%`;
}

/* ============== 主页面 ============== */
export default function ChannelsPage() {
  // 数据状态
  const [channels, setChannels] = React.useState<ChannelData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 筛选
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterProvider, setFilterProvider] = React.useState("");

  // 弹窗状态
  const [formChannel, setFormChannel] = React.useState<ChannelData | null | undefined>(undefined);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);
  const [testResult, setTestResult] = React.useState<{ result: ChannelTestResult; name: string } | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);

  // 搜索防抖
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载服务商列表（用于筛选和表单下拉）
  const fetchProviders = React.useCallback(async () => {
    try {
      const res = await getProviders({ pageSize: 100 });
      setProviders(res.items);
    } catch {
      // 静默失败
    }
  }, []);

  // 加载渠道数据
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
  }, [page, search, filterProvider]);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  React.useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // 测试连通性
  const handleTest = async (ch: ChannelData) => {
    setTestingId(ch.id);
    try {
      const result = await testChannel(ch.id);
      setTestResult({ result, name: ch.name });
    } catch (err) {
      setTestResult({
        result: { success: false, latencyMs: 0, message: err instanceof Error ? err.message : "测试失败" },
        name: ch.name,
      });
    } finally {
      setTestingId(null);
    }
  };

  // 启用/禁用
  const handleToggle = (ch: ChannelData) => {
    if (ch.isActive) {
      setConfirmAction({
        title: "禁用渠道",
        message: `确定要禁用渠道「${ch.name}」吗？禁用后该渠道将不再参与请求分发。`,
        confirmText: "禁用",
        onConfirm: async () => {
          try {
            await disableChannel(ch.id);
            fetchChannels();
          } catch (err) {
            alert(err instanceof Error ? err.message : "操作失败");
          }
        },
      });
    } else {
      setConfirmAction({
        title: "启用渠道",
        message: `确定要启用渠道「${ch.name}」吗？`,
        confirmText: "启用",
        confirmColor: "bg-success hover:bg-success/90",
        onConfirm: async () => {
          try {
            await enableChannel(ch.id);
            fetchChannels();
          } catch (err) {
            alert(err instanceof Error ? err.message : "操作失败");
          }
        },
      });
    }
  };

  // 删除
  const handleDelete = (ch: ChannelData) => {
    setConfirmAction({
      title: "删除渠道",
      message: `确定要删除渠道「${ch.name}」吗？删除后不可恢复。`,
      onConfirm: async () => {
        try {
          await deleteChannel(ch.id);
          fetchChannels();
        } catch (err) {
          alert(err instanceof Error ? err.message : "删除失败");
        }
      },
    });
  };

  return (
    <AdminShell title="通道管理">
      {/* 搜索 + 筛选 + 操作栏 */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-72">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索渠道..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={filterProvider}
            onChange={(e) => {
              setFilterProvider(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">全部服务商</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setFormChannel(null)}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600"
        >
          + 新建渠道
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchChannels} className="text-sm text-primary hover:underline">
            重试
          </button>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">渠道名称</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">服务商</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">Base URL</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">Key 前缀</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">请求数</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">成功率</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">延迟</th>
              <th className="font-normal text-center px-4 py-3 text-[13px]">权重/优先级</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">加载中...</p>
                </td>
              </tr>
            ) : channels.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                  暂无数据
                </td>
              </tr>
            ) : (
              channels.map((ch) => {
                const status = getChannelStatusLabel(ch.status);
                const successRate = calcSuccessRate(ch);
                const isTesting = testingId === ch.id;
                return (
                  <tr key={ch.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] text-gray-800 font-medium">{ch.name}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {ch.provider?.displayName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-mono truncate max-w-[180px]">
                      {ch.baseUrl}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{ch.keyPrefix}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">
                      {formatNumber(ch.totalRequests)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <span
                        className={
                          successRate !== "-" && parseFloat(successRate) < 95
                            ? "text-red-600"
                            : "text-gray-600"
                        }
                      >
                        {successRate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">
                      {ch.avgLatencyMs > 0 ? `${ch.avgLatencyMs}ms` : "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-center text-gray-500">
                      {ch.weight}/{ch.priority}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTest(ch)}
                          disabled={isTesting}
                          className="px-2 py-1 text-xs text-info hover:bg-info/10 rounded disabled:opacity-50"
                        >
                          {isTesting ? "测试中..." : "测试"}
                        </button>
                        <button
                          onClick={() => handleToggle(ch)}
                          className={`px-2 py-1 text-xs rounded ${
                            ch.isActive
                              ? "text-warning hover:bg-warning/10"
                              : "text-success hover:bg-success/10"
                          }`}
                        >
                          {ch.isActive ? "禁用" : "启用"}
                        </button>
                        <button
                          onClick={() => setFormChannel(ch)}
                          className="px-2 py-1 text-xs text-primary hover:bg-primary-50 rounded"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(ch)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            共 {total} 条，第 {page}/{totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 弹窗 */}
      {formChannel !== undefined && (
        <ChannelFormModal
          channel={formChannel}
          providers={providers}
          onClose={() => setFormChannel(undefined)}
          onSaved={() => {
            setFormChannel(undefined);
            fetchChannels();
          }}
        />
      )}
      {confirmAction && <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} />}
      {testResult && (
        <TestResultModal
          result={testResult.result}
          channelName={testResult.name}
          onClose={() => setTestResult(null)}
        />
      )}
    </AdminShell>
  );
}
