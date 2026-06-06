"use client";

/**
 * 模型价格总览页
 *
 * 展示所有模型的定价信息，支持编辑。
 * 后端 API：GET /admin/models, PUT /admin/models/:id/pricing
 */

import * as React from "react";
import {
  getModels,
  upsertModelPricing,
  getProviders,
  getModelStatusLabel,
  type ModelData,
  type ProviderData,
  type UpsertPricingPayload,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 格式化价格 ============== */
function formatPrice(fenPerMillion: number): string {
  const yuan = fenPerMillion / 100;
  if (yuan === 0) return "免费";
  if (yuan < 0.01) return "<0.01";
  return yuan.toFixed(2);
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
          <p className="text-xs text-gray-400 mt-1">价格单位：元/百万 Token（输入为分，自动转换）</p>
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
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">≈ ¥{formatPrice(Number(inputPrice))}/百万</p>
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
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">≈ ¥{formatPrice(Number(outputPrice))}/百万</p>
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
                    placeholder="可选"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
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
                    placeholder="可选"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
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
export default function PricingPage() {
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
  const [pricingModel, setPricingModel] = React.useState<ModelData | null>(null);

  // 搜索防抖
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载服务商列表
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
      const res = await getModels({ page, pageSize: 50, search: search || undefined });
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

  return (
    <AdminShell title="模型价格">
      {/* 搜索栏 */}
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
        <p className="text-sm text-gray-400">价格单位：元/百万 Token</p>
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
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">模型</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">服务商</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">输入价</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">输出价</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">缓存价</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">推理价</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">倍率</th>
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
                const p = m.pricing;
                return (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px]">
                      <div>
                        <span className="text-gray-800 font-medium">{m.displayName}</span>
                        <span className="ml-2 text-gray-400 font-mono text-xs">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{getProviderName(m.providerId)}</td>
                    <td className="px-4 py-3 text-[13px] text-right font-mono">
                      {p ? (
                        <span className="text-gray-800">¥{formatPrice(p.inputPrice)}</span>
                      ) : (
                        <span className="text-gray-400">未设置</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right font-mono">
                      {p ? (
                        <span className="text-gray-800">¥{formatPrice(p.outputPrice)}</span>
                      ) : (
                        <span className="text-gray-400">未设置</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right font-mono">
                      {p?.cachedPrice != null ? (
                        <span className="text-gray-600">¥{formatPrice(p.cachedPrice)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right font-mono">
                      {p?.reasoningPrice != null ? (
                        <span className="text-gray-600">¥{formatPrice(p.reasoningPrice)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right font-mono">
                      {p ? (
                        <span className="text-gray-600">{p.multiplier}x</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <button
                        onClick={() => setPricingModel(m)}
                        className="px-3 py-1 text-xs text-primary hover:bg-primary-50 rounded border border-primary/20"
                      >
                        编辑定价
                      </button>
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
    </AdminShell>
  );
}
