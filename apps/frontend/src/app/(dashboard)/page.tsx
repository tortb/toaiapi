'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import type { Balance, RequestLog } from '@/types';
import { formatAmount, formatTokens, formatDate } from '@/lib/utils';
import {
  Wallet,
  Snowflake,
  Coins,
  KeyRound,
  FileText,
  Settings,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, logsData] = await Promise.all([
        api.balance.get(),
        api.balance.getLogs(1, 5),
      ]);
      setBalance(balanceData);
      setLogs(logsData.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* 页面标题 */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">概览</h3>
        <p className="text-sm text-muted-foreground">您的账户信息和最近活动</p>
      </div>

      {/* 余额卡片 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总余额</p>
              <p className="text-2xl font-bold text-foreground">
                {balance ? formatAmount(balance.amount) : '¥0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Snowflake className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">冻结金额</p>
              <p className="text-2xl font-bold text-foreground">
                {balance ? formatAmount(balance.frozen) : '¥0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Coins className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">可用余额</p>
              <p className="text-2xl font-bold text-success">
                {balance ? formatAmount(balance.available) : '¥0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/api-keys"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <KeyRound className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">管理 API Key</p>
            <p className="text-xs text-muted-foreground">创建和管理密钥</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/usage"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">使用记录</p>
            <p className="text-xs text-muted-foreground">查看调用和费用</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/settings"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Settings className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">账户设置</p>
            <p className="text-xs text-muted-foreground">修改信息和密码</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 最近请求 */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">最近请求</h3>
          </div>
          {logs.length > 0 && (
            <Link href="/usage" className="text-sm text-primary hover:text-primary/80">
              查看全部
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">模型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">费用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50">
                  <td className="px-6 py-3 text-sm font-medium text-foreground">
                    {log.modelId}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {formatTokens(log.totalTokens)}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {formatAmount(log.cost)}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {log.latencyMs}ms
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    暂无请求记录，创建 API Key 后即可开始调用
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
