"use client";

/**
 * API Key 管理页面
 *
 * 展示所有 API Key，支持搜索、筛选、启用/禁用、删除。
 */

import * as React from "react";
import {
  getApiKeys,
  toggleApiKey,
  deleteApiKey,
  formatDate,
  type ApiKeyAdminData,
  type PaginatedResponse,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 确认弹窗 ============== */
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const [data, setData] = React.useState<PaginatedResponse<ApiKeyAdminData> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 筛选状态
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  // 确认弹窗
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // 加载 API Key 列表
  const fetchApiKeys = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getApiKeys({
        page,
        pageSize,
        search: search || undefined,
        isActive: statusFilter === "" ? undefined : statusFilter === "active",
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  React.useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  // 搜索防抖
  const [searchInput, setSearchInput] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 切换状态
  const handleToggle = (key: ApiKeyAdminData) => {
    setConfirmAction({
      title: `${key.isActive ? "禁用" : "启用"} API Key`,
      message: `确定要${key.isActive ? "禁用" : "启用"} API Key "${key.name || key.keyPrefix}" 吗？`,
      onConfirm: async () => {
        try {
          await toggleApiKey(key.id);
          fetchApiKeys();
        } catch (err) {
          alert(err instanceof Error ? err.message : "操作失败");
        }
        setConfirmAction(null);
      },
    });
  };

  // 删除
  const handleDelete = (key: ApiKeyAdminData) => {
    setConfirmAction({
      title: "删除 API Key",
      message: `确定要删除 API Key "${key.name || key.keyPrefix}" 吗？此操作不可撤销。`,
      onConfirm: async () => {
        try {
          await deleteApiKey(key.id);
          fetchApiKeys();
        } catch (err) {
          alert(err instanceof Error ? err.message : "删除失败");
        }
        setConfirmAction(null);
      },
    });
  };

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AdminShell title="API Key 管理">
      {/* 确认弹窗 */}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchApiKeys} className="text-sm text-primary hover:underline">
            重试
          </button>
        </div>
      )}

      {/* 筛选区 */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索 Key 前缀 / 名称 / 用户邮箱..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">所有状态</option>
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>

          {/* 刷新按钮 */}
          <button
            onClick={fetchApiKeys}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            刷新
          </button>
        </div>
      </div>

      {/* API Key 表格 */}
      <div className="bg-white rounded-lg border border-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-left font-normal px-4 py-3">API Key</th>
                    <th className="text-left font-normal px-4 py-3">用户</th>
                    <th className="text-left font-normal px-4 py-3">状态</th>
                    <th className="text-left font-normal px-4 py-3">调用次数</th>
                    <th className="text-left font-normal px-4 py-3">最后使用</th>
                    <th className="text-left font-normal px-4 py-3">创建时间</th>
                    <th className="text-right font-normal px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((k) => (
                    <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-mono text-gray-900">{k.keyPrefix}...</div>
                          {k.name && (
                            <div className="text-[11px] text-gray-500 mt-0.5">{k.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-gray-900">{k.userEmail}</div>
                          {k.userName && (
                            <div className="text-[11px] text-gray-500">{k.userName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {k.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            启用
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            禁用
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">
                        {formatNumber(k.totalRequests)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-[12px]">
                        {k.lastUsedAt ? formatDate(k.lastUsedAt) : "从未使用"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-[12px]">
                        {formatDate(k.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(k)}
                            className={`px-2 py-1 text-[11px] rounded ${
                              k.isActive
                                ? "text-warning hover:bg-warning/10"
                                : "text-success hover:bg-success/10"
                            }`}
                          >
                            {k.isActive ? "禁用" : "启用"}
                          </button>
                          <button
                            onClick={() => handleDelete(k)}
                            className="px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 rounded"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  共 {data.total} 条，第 {data.page}/{data.totalPages} 页
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">暂无 API Key 数据</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
