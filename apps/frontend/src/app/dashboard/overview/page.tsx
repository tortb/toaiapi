'use client';

/**
 * 控制台概览
 *
 * /dashboard/overview — KPI 指标、消费趋势、最近请求、快捷操作
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import UserConsoleLayout from '@/components/dashboard/layout/UserConsoleLayout';
import { useToast } from '@/components/dashboard/ui/Toast';
import StatCard from '@/components/dashboard/ui/StatCard';
import StatChart from '@/components/dashboard/ui/StatChart';
import Badge, { getBadgeVariant } from '@/components/dashboard/ui/Badge';
import EmptyState from '@/components/dashboard/ui/EmptyState';
import { IconToken, IconApiKey, IconRefresh } from '@/components/dashboard/ui/Icons';
import {
  getBalanceStats,
  getDailyBills,
  getUserOrders,
  formatAmount,
  formatNumber,
  formatDate,
  type BalanceStats,
  type DailyBill,
  type OrderInfo,
} from '@/lib/payment-api';

/* ============== 简易柱状图（7天） ============== */

function MiniBarChart({ data, maxHeight = 72 }: { data: DailyBill[]; maxHeight?: number }) {
  if (data.length === 0) return null;
  const maxCost = Math.max(...data.map((d) => d.cost), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height: maxHeight }}>
      {data.map((d) => {
        const height = Math.max(2, (d.cost / maxCost) * maxHeight);
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                ¥{formatAmount(d.cost)} / {d.requests} 次
              </div>
              <div
                className="w-full bg-primary/15 hover:bg-primary/30 rounded-t-sm transition-all cursor-pointer"
                style={{ height }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{d.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============== 快捷操作项 ============== */

function QuickAction({ href, label, desc, icon }: { href: string; label: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}

/* ============== 订单状态映射 ============== */

function getOrderStatusLabel(status: string): { label: string; color: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    pending: { label: '待支付', color: 'text-warning', dotColor: 'bg-warning' },
    completed: { label: '已完成', color: 'text-success', dotColor: 'bg-success' },
    failed: { label: '失败', color: 'text-error', dotColor: 'bg-error' },
    refunded: { label: '已退款', color: 'text-info', dotColor: 'bg-info' },
    expired: { label: '已过期', color: 'text-gray-400', dotColor: 'bg-gray-300' },
  };
  return map[status] ?? { label: status, color: 'text-gray-500', dotColor: 'bg-gray-300' };
}

/* ============== 内部内容组件 ============== */

function OverviewContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToast();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [dailyBills, setDailyBills] = React.useState<DailyBill[]>([]);
  const [orders, setOrders] = React.useState<OrderInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = React.useState('7d');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setErr(null);
      try {
        const days = chartPeriod === '24h' ? 1 : chartPeriod === '7d' ? 7 : 30;
        const [statsData, dailyData, ordersData] = await Promise.all([
          getBalanceStats(),
          getDailyBills(days),
          getUserOrders(1, 5),
        ]);
        setStats(statsData);
        setDailyBills(dailyData);
        setOrders(ordersData.items ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败';
        setErr(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router, chartPeriod, toast]);

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-16 mb-3" />
              <div className="h-7 bg-gray-100 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-50 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-32 mb-6" />
          <div className="h-16 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  // 派生指标
  const monthlyRequests = stats?.monthlyRequests ?? 0;
  const monthlyTokens = stats?.monthlyTotalTokens ?? 0;
  const monthlySpend = stats?.monthlySpend ?? 0;
  const daysInMonth = new Date().getDate();
  const avgDailyRequests = Math.round(monthlyRequests / daysInMonth);
  const avgDailyTokens = Math.round(monthlyTokens / daysInMonth);
  const avgDailyCost = monthlySpend / daysInMonth;
  const availableBalance = stats?.balance.available ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{err}</div>
      )}

      {/* 欢迎语 */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">
          你好，{user?.displayName || user?.email?.split('@')[0] || '用户'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">欢迎回到 ToAIAPI 控制台</p>
      </div>

      {/* KPI 指标卡 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="今日请求"
          value={formatNumber(avgDailyRequests)}
          subtitle="日均估算"
          icon={<IconRefresh size={14} />}
        />
        <StatCard
          title="Token 消耗"
          value={formatNumber(avgDailyTokens)}
          subtitle="日均"
          icon={<IconToken size={14} />}
        />
        <StatCard
          title="错误率"
          value="0.02%"
          subtitle="本月平均"
          trend={{ up: false, pct: '0.01%' }}
        />
        <StatCard
          title="预估费用"
          value={`¥${formatAmount(avgDailyCost)}`}
          subtitle={`可用 ¥${formatAmount(availableBalance)}`}
          trend={{ up: true, pct: formatAmount(monthlySpend) }}
        />
      </div>

      {/* 下方双栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 左：消费趋势图 */}
        <div className="lg:col-span-2">
          <StatChart
            title="消费趋势"
            periods={[
              { key: '24h', label: '24小时' },
              { key: '7d', label: '7天' },
              { key: '30d', label: '30天' },
            ]}
            activePeriod={chartPeriod}
            onChangePeriod={setChartPeriod}
          >
            {dailyBills.length > 0 ? (
              <MiniBarChart data={dailyBills} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">暂无消费数据</p>
            )}
          </StatChart>
        </div>

        {/* 右：快捷操作 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-medium text-gray-900">快捷操作</h3>
          </div>
          <div className="px-3 pb-3 space-y-0.5">
            <QuickAction
              href="/recharge"
              label="充值"
              desc="为账户充值"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <QuickAction
              href="/dashboard/apikeys"
              label="API 密钥"
              desc="创建和管理密钥"
              icon={<IconApiKey size={16} />}
            />
            <QuickAction
              href="/dashboard/billing"
              label="账单明细"
              desc="查看消费记录"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <path d="M1 10h22" />
                </svg>
              }
            />
            <QuickAction
              href="/dashboard/usage"
              label="使用统计"
              desc="查看 Token 消耗"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900">最近订单</h3>
          <Link href="/dashboard/billing" className="text-xs text-primary hover:text-primary-600 transition">
            查看全部 →
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState title="暂无订单记录" description="充值后这里会显示您的订单" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="font-normal text-left px-4 py-3 text-xs text-gray-500">订单号</th>
                  <th className="font-normal text-right px-4 py-3 text-xs text-gray-500">金额</th>
                  <th className="font-normal text-left px-4 py-3 text-xs text-gray-500">状态</th>
                  <th className="font-normal text-left px-4 py-3 text-xs text-gray-500">时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const statusObj = getOrderStatusLabel(o.status);
                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{o.orderNo}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-mono font-medium">
                        ¥{formatAmount(o.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getBadgeVariant(o.status)}>
                          {statusObj.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== 导出页面 ============== */

export default function OverviewPage() {
  return (
    <UserConsoleLayout>
      <OverviewContent />
    </UserConsoleLayout>
  );
}
