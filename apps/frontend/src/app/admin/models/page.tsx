"use client";

/**
 * 模型管理页
 *
 * Model CRUD + 定价编辑。
 * 后端 API：GET/POST/PATCH/DELETE /admin/models, PUT /admin/models/:id/pricing
 */

import * as React from "react";
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  upsertModelPricing,
  getProviders,
  formatDate,
  getModelStatusLabel,
  type ModelData,
  type ProviderData,
  type CreateModelPayload,
  type UpsertPricingPayload,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 确认弹窗 ============== */
interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
}

function ConfirmModal({ action, onClose }: { action: ConfirmAction; onClose: () => void }) {
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
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 格式化价格 ============== */
function formatPrice(yuanPerMillion: number): string {
  if (yuanPerMillion === 0) return "免费";
  if (yuanPerMillion < 0.01) return "<0.01";
  return yuanPerMillion.toFixed(2);
}

/* ============== 能力标签 ============== */
function CapabilityBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[11px] rounded ${
        active ? "bg-primary-50 text-primary" : "bg-gray-100 text-gray-400"
      }`}
    >
      {label}
    </span>
  );
}

/* ============== 新建/编辑模型弹窗 ============== */
interface ModelFormProps {
  model?: ModelData | null;
  providers: ProviderData[];
  onClose: () => void;
  onSaved: () => void;
}

function ModelFormModal({ model, providers, onClose, onSaved }: ModelFormProps) {
  const [name, setName] = React.useState(model?.name ?? "");
  const [displayName, setDisplayName] = React.useState(model?.displayName ?? "");
  const [providerId, setProviderId] = React.useState(model?.providerId ?? "");
  const [maxContext, setMaxContext] = React.useState(String(model?.maxContext ?? 128000));
  const [supportsStreaming, setSupportsStreaming] = React.useState(model?.supportsStreaming ?? true);
  const [supportsTools, setSupportsTools] = React.useState(model?.supportsTools ?? false);
  const [supportsVision, setSupportsVision] = React.useState(model?.supportsVision ?? false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = !!model;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && model) {
        await updateModel(model.id, {
          displayName,
          maxContext: Number(maxContext),
          supportsStreaming,
          supportsTools,
          supportsVision,
        });
      } else {
        await createModel({
          name,
          displayName,
          providerId,
          maxContext: Number(maxContext),
          supportsStreaming,
          supportsTools,
          supportsVision,
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
          <h3 className="text-base font-medium text-gray-900">{isEdit ? "编辑模型" : "新建模型"}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
            )}
            {!isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模型标识 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：gpt-4o, deepseek-chat"
                    required
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    服务商 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">请选择服务商</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.displayName} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                显示名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例如：GPT-4o, DeepSeek Chat"
                required
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                上下文长度 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={maxContext}
                onChange={(e) => setMaxContext(e.target.value)}
                min={1}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportsStreaming}
                  onChange={(e) => setSupportsStreaming(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">流式输出</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportsTools}
                  onChange={(e) => setSupportsTools(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">工具调用</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportsVision}
                  onChange={(e) => setSupportsVision(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">视觉</span>
              </label>
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

/* ============== 编辑定价弹窗 ============== */
interface PricingFormProps {
  model: ModelData;
  onClose: () => void;
  onSaved: () => void;
}

function PricingFormModal({ model, onClose, onSaved }: PricingFormProps) {
  const p = model.pricing;
  const [inputPrice, setInputPrice] = React.useState(String(p?.inputPrice ?? 0));
  const [outputPrice, setOutputPrice] = React.useState(String(p?.outputPrice ?? 0));
  const [cachedPrice, setCachedPrice] = React.useState(String(p?.cachedPrice ?? ""));
  const [reasoningPrice, setReasoningPrice] = React.useState(String(p?.reasoningPrice ?? ""));
  const [multiplier, setMultiplier] = React.useState(String(p?.multiplier ?? 1.0));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: UpsertPricingPayload = {
        inputPrice: Number(inputPrice),
        outputPrice: Number(outputPrice),
        multiplier: Number(multiplier),
      };
      if (cachedPrice) payload.cachedPrice = Number(cachedPrice);
      if (reasoningPrice) payload.reasoningPrice = Number(reasoningPrice);
      await upsertModelPricing(model.id, payload);
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
          <h3 className="text-base font-medium text-gray-900">编辑定价 - {model.displayName}</h3>
          <p className="text-xs text-gray-400 mt-1">价格单位：元/百万 Token</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输入价格 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    min={0}
                    step={0.0001}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">元/百万</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">¥{formatPrice(Number(inputPrice))}/百万 Token</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输出价格 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={outputPrice}
                    onChange={(e) => setOutputPrice(e.target.value)}
                    min={0}
                    step={0.0001}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">元/百万</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">¥{formatPrice(Number(outputPrice))}/百万 Token</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">缓存价格</label>
                <div className="relative">
                  <input
                    type="number"
                    value={cachedPrice}
                    onChange={(e) => setCachedPrice(e.target.value)}
                    min={0}
                    step={0.0001}
                    placeholder="可选"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">元/百万</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推理价格</label>
                <div className="relative">
                  <input
                    type="number"
                    value={reasoningPrice}
                    onChange={(e) => setReasoningPrice(e.target.value)}
                    min={0}
                    step={0.0001}
                    placeholder="可选"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">元/百万</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格倍率</label>
              <input
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="mt-1 text-xs text-gray-400">最终价格 = 基础价格 × 倍率</p>
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

/* ============== 主页面 ============== */
export default function ModelsPage() {
  // 数据状态
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 搜索
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");

  // 弹窗状态
  const [formModel, setFormModel] = React.useState<ModelData | null | undefined>(undefined);
  const [pricingModel, setPricingModel] = React.useState<ModelData | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  // 搜索防抖
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载服务商列表（用于表单下拉）
  const fetchProviders = React.useCallback(async () => {
    try {
      const res = await getProviders({ pageSize: 100 });
      setProviders(res.items);
    } catch {
      // 静默失败
    }
  }, []);

  // 加载模型数据
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
    fetchProviders();
  }, [fetchProviders]);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // 获取 Provider 显示名
  const getProviderName = (providerId: string): string => {
    const p = providers.find((x) => x.id === providerId);
    return p?.displayName ?? providerId;
  };

  // 切换模型状态
  const handleToggleStatus = (model: ModelData) => {
    if (model.isActive) {
      setConfirmAction({
        title: "下架模型",
        message: `确定要下架模型「${model.displayName}」吗？下架后用户将无法使用该模型。`,
        onConfirm: async () => {
          try {
            await updateModel(model.id, { isActive: false });
            fetchModels();
          } catch (err) {
            alert(err instanceof Error ? err.message : "操作失败");
          }
        },
      });
    } else {
      setConfirmAction({
        title: "上架模型",
        message: `确定要上架模型「${model.displayName}」吗？`,
        onConfirm: async () => {
          try {
            await updateModel(model.id, { isActive: true });
            fetchModels();
          } catch (err) {
            alert(err instanceof Error ? err.message : "操作失败");
          }
        },
      });
    }
  };

  // 删除
  const handleDelete = (model: ModelData) => {
    setConfirmAction({
      title: "删除模型",
      message: `确定要删除模型「${model.displayName}」吗？此操作不可撤销。`,
      onConfirm: async () => {
        try {
          await deleteModel(model.id);
          fetchModels();
        } catch (err) {
          alert(err instanceof Error ? err.message : "删除失败");
        }
      },
    });
  };

  return (
    <AdminShell title="模型管理">
      {/* 搜索 + 操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索模型..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setFormModel(null)}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600"
        >
          + 新建模型
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchModels} className="text-sm text-primary hover:underline">
            重试
          </button>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">模型标识</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">显示名称</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">服务商</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">上下文</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">能力</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">输入价</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">输出价</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">加载中...</p>
                </td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                  暂无数据
                </td>
              </tr>
            ) : (
              models.map((m) => {
                const status = getModelStatusLabel(m.isActive);
                return (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-800">{m.displayName}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{getProviderName(m.providerId)}</td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">
                      {m.maxContext >= 1000000
                        ? `${(m.maxContext / 1000000).toFixed(0)}M`
                        : m.maxContext >= 1000
                          ? `${(m.maxContext / 1000).toFixed(0)}K`
                          : m.maxContext}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      <div className="flex gap-1">
                        <CapabilityBadge label="流式" active={m.supportsStreaming} />
                        <CapabilityBadge label="工具" active={m.supportsTools} />
                        <CapabilityBadge label="视觉" active={m.supportsVision} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">
                      {m.pricing ? `¥${formatPrice(m.pricing.inputPrice)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">
                      {m.pricing ? `¥${formatPrice(m.pricing.outputPrice)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPricingModel(m)}
                          className="px-2 py-1 text-xs text-orange hover:bg-orange/10 rounded"
                        >
                          定价
                        </button>
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`px-2 py-1 text-xs rounded ${
                            m.isActive ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"
                          }`}
                        >
                          {m.isActive ? "下架" : "上架"}
                        </button>
                        <button
                          onClick={() => setFormModel(m)}
                          className="px-2 py-1 text-xs text-primary hover:bg-primary-50 rounded"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
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
      {formModel !== undefined && (
        <ModelFormModal
          model={formModel}
          providers={providers}
          onClose={() => setFormModel(undefined)}
          onSaved={() => {
            setFormModel(undefined);
            fetchModels();
          }}
        />
      )}
      {pricingModel && (
        <PricingFormModal
          model={pricingModel}
          onClose={() => setPricingModel(null)}
          onSaved={() => {
            setPricingModel(null);
            fetchModels();
          }}
        />
      )}
      {confirmAction && <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} />}
    </AdminShell>
  );
}
