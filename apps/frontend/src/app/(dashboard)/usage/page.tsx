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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载使用记录失败');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 h-7 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">使用记录</h3>
        <p className="text-sm text-muted-foreground">查看 API 调用历史和费用</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-destructive/70 hover:text-destructive"
          >
            关闭
          </button>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总请求数</p>
              <p className="text-2xl font-bold text-foreground">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Hash className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">本页 Token</p>
              <p className="text-2xl font-bold text-foreground">{formatTokens(totalTokens)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Coins className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">本页费用</p>
              <p className="text-2xl font-bold text-foreground">{formatAmount(totalCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            placeholder="搜索模型..."
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 请求列表 */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">模型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">输入</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">输出</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">总计</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">费用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    {modelFilter ? '无匹配的记录' : '暂无请求记录'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">
                      {log.modelId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">
                      {formatTokens(log.promptTokens)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">
                      {formatTokens(log.completionTokens)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">
                      {formatTokens(log.totalTokens)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">
                      {formatAmount(log.cost)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">
                      {log.latencyMs}ms
                    </td>
                    <td className="whitespace-nowrap px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          log.statusCode === 200
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">
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
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <span className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
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
