'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { RequestLog } from '@/types';
import { formatAmount, formatTokens, formatDate } from '@/lib/utils';

/**
 * 使用记录页面
 */
export default function UsagePage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.balance.getLogs(page, 20);
      setLogs(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // 统计
  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">使用记录</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">总请求数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">总 Token</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatTokens(totalTokens)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">总费用</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatAmount(totalCost)}</p>
        </div>
      </div>

      {/* 请求列表 */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  模型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  输入 Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  输出 Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  总 Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  费用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  延迟
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无请求记录
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {log.modelId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatTokens(log.promptTokens)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatTokens(log.completionTokens)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatTokens(log.totalTokens)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatAmount(log.cost)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {log.latencyMs}ms
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          log.statusCode === 200
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              上一页
            </button>
            <span className="text-sm text-gray-600">
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
