'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Balance, RequestLog } from '@/types';
import { formatAmount, formatTokens, formatDate } from '@/lib/utils';

/**
 * 仪表盘首页
 */
export default function DashboardPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, logsData] = await Promise.all([
        api.balance.get(),
        api.balance.getLogs(1, 10),
      ]);
      setBalance(balanceData);
      setLogs(logsData.items);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 余额卡片 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">总余额</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {balance ? formatAmount(balance.amount) : '¥0.00'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">冻结金额</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {balance ? formatAmount(balance.frozen) : '¥0.00'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">可用余额</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {balance ? formatAmount(balance.available) : '¥0.00'}
          </p>
        </div>
      </div>

      {/* 最近请求 */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">最近请求</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  模型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  费用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  延迟
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {log.modelId}
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无请求记录
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
