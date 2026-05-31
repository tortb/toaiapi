'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { RequestLog } from '@/types';
import { formatAmount, formatTokens, formatDate } from '@/lib/utils';
import {
  Activity,
  Coins,
  Hash,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

export default function UsagePage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState('');

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

  const filteredLogs = modelFilter
    ? logs.filter((log) => log.modelId.toLowerCase().includes(modelFilter.toLowerCase()))
    : logs;

  const totalTokens = filteredLogs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalCost = filteredLogs.reduce((sum, log) => sum + log.cost, 0);

  const uniqueModels = Array.from(new Set(logs.map((l) => l.modelId)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">使用记录</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总请求数</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <Hash className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">本页 Token</p>
              <p className="text-2xl font-bold text-gray-900">{formatTokens(totalTokens)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Coins className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">本页费用</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(totalCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            placeholder="搜索模型..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {uniqueModels.length > 0 && (
          <div className="flex gap-2">
            {uniqueModels.slice(0, 5).map((model) => (
              <button
                key={model}
                onClick={() => setModelFilter(modelFilter === model ? '' : model)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  modelFilter === model
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 请求列表 */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">模型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">输入</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">输出</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">总计</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">费用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                    加载中...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                    {modelFilter ? '无匹配的记录' : '暂无请求记录'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {log.modelId}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatTokens(log.promptTokens)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatTokens(log.completionTokens)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatTokens(log.totalTokens)}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {formatAmount(log.cost)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {log.latencyMs}ms
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          log.statusCode === 200
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
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
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <span className="text-sm text-gray-600">
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}