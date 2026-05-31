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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-red-600 hover:text-red-500"
          >
            关闭
          </button>
        </div>
      )}

      {/* 余额卡片 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总余额</p>
              <p className="text-2xl font-bold text-gray-900">
                {balance ? formatAmount(balance.amount) : '¥0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Snowflake className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">冻结金额</p>
              <p className="text-2xl font-bold text-gray-900">
                {balance ? formatAmount(balance.frozen) : '¥0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Coins className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">可用余额</p>
              <p className="text-2xl font-bold text-green-600">
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
          className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
            <KeyRound className="h-5 w-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">管理 API Key</p>
            <p className="text-xs text-gray-500">创建和管理密钥</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/usage"
          className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
            <FileText className="h-5 w-5 text-cyan-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">使用记录</p>
            <p className="text-xs text-gray-500">查看调用和费用</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/settings"
          className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
            <Settings className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">账户设置</p>
            <p className="text-xs text-gray-500">修改信息和密码</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 最近请求 */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900">最近请求</h3>
          </div>
          {logs.length > 0 && (
            <Link href="/usage" className="text-sm text-blue-600 hover:text-blue-500">
              查看全部
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">模型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">费用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {log.modelId}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatTokens(log.totalTokens)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatAmount(log.cost)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {log.latencyMs}ms
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
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
