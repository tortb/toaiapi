"use client";

/**
 * 服务商管理页
 *
 * Provider CRUD：列表、新建、编辑、删除。
 * 后端 API：GET/POST/PATCH/DELETE /admin/providers
 */

import * as React from "react";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  formatDate,
  getProviderStatusLabel,
  type ProviderData,
  type CreateProviderPayload,
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

/* ============== 新建/编辑弹窗 ============== */
interface ProviderFormProps {
  provider?: ProviderData | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProviderFormModal({ provider, onClose, onSaved }: ProviderFormProps) {
  const [name, setName] = React.useState(provider?.name ?? "");
  const [displayName, setDisplayName] = React.useState(provider?.displayName ?? "");
  const [baseUrl, setBaseUrl] = React.useState(provider?.baseUrl ?? "");
  const [isActive, setIsActive] = React.useState(provider?.isActive ?? true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = !!provider;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && provider) {
        await updateProvider(provider.id, { displayName, baseUrl, isActive });
      } else {
        await createProvider({ name, displayName, baseUrl, isActive });
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
            {isEdit ? "编辑服务商" : "新建服务商"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标识名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：openai, deepseek"
                  required
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                显示名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例如：OpenAI, DeepSeek"
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                启用
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

/* ============== 主页面 ============== */
export default function ProvidersPage() {
  // 数据状态
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
  const [formProvider, setFormProvider] = React.useState<ProviderData | null | undefined>(undefined);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  // 搜索防抖
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载数据
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

  // 删除
  const handleDelete = (provider: ProviderData) => {
    setConfirmAction({
      title: "删除服务商",
      message: `确定要删除服务商「${provider.displayName}」吗？如果该服务商下有关联渠道，删除将被拒绝。此操作不可撤销。`,
      onConfirm: async () => {
        try {
          await deleteProvider(provider.id);
          fetchProviders();
        } catch (err) {
          alert(err instanceof Error ? err.message : "删除失败");
        }
      },
    });
  };

  return (
    <AdminShell title="服务商管理">
      {/* 搜索 + 操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索服务商..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setFormProvider(null)}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600"
        >
          + 新建服务商
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchProviders} className="text-sm text-primary hover:underline">
            重试
          </button>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">标识名</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">显示名称</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">Base URL</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">渠道数</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">加载中...</p>
                </td>
              </tr>
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  暂无数据
                </td>
              </tr>
            ) : (
              providers.map((p) => {
                const status = getProviderStatusLabel(p.isActive);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-800">{p.displayName}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-mono truncate max-w-[240px]">
                      {p.baseUrl}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{p.channelCount}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setFormProvider(p)}
                          className="px-2.5 py-1 text-xs text-primary hover:bg-primary-50 rounded"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
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
      {formProvider !== undefined && (
        <ProviderFormModal
          provider={formProvider}
          onClose={() => setFormProvider(undefined)}
          onSaved={() => {
            setFormProvider(undefined);
            fetchProviders();
          }}
        />
      )}
      {confirmAction && <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} />}
    </AdminShell>
  );
}
