'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import type { ChannelStatus } from '@/types';

const statusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return '正常';
    case 'ERROR': return '故障';
    case 'RATE_LIMITED': return '降级';
    default: return status;
  }
};

const statusVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success' as const;
    case 'ERROR': return 'destructive' as const;
    case 'RATE_LIMITED': return 'warning' as const;
    default: return 'secondary' as const;
  }
};

/** 服务状态页面 */
export default function StatusPage() {
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.status.get();
      setChannels(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载状态失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const allNormal = channels.length > 0 && channels.every((c) => c.status === 'ACTIVE');

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          服务状态
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          所有渠道实时运行状态
        </p>

        {/* 整体状态 */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-6">
          {loading ? (
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <div className={`h-3 w-3 rounded-full ${allNormal ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-lg font-medium text-foreground">
                {allNormal ? '所有系统正常运行' : '部分服务存在异常'}
              </span>
            </>
          )}
        </div>

        {/* 渠道状态表格 */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-sm text-destructive">{error}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">渠道</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">延迟</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">总请求</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">失败率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {channels.map((row) => (
                  <tr key={`${row.provider}-${row.channel}`} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm text-foreground">{row.provider}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{row.channel}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.avgLatencyMs}ms</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.totalRequests.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.failureRate}%
                    </td>
                  </tr>
                ))}
                {channels.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      暂无渠道数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 说明 */}
        <p className="mt-4 text-xs text-muted-foreground">
          * 状态数据实时更新。延迟为指数移动平均值。
        </p>
      </div>
    </div>
  );
}
