'use client';

/**
 * 账单中心
 *
 * /dashboard/billing — 余额概览、套餐信息、充值入口、消费趋势、消费明细
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import UserConsoleLayout from '@/components/dashboard/layout/UserConsoleLayout';
import StatCard from '@/components/dashboard/ui/StatCard';
import StatChart from '@/components/dashboard/ui/StatChart';
import Badge, { getBadgeVariant } from '@/components/dashboard/ui/Badge';
import EmptyState from '@/components/dashboard/ui/EmptyState';
import Drawer from '@/components/dashboard/ui/Drawer';
import { IconToken, IconRefresh } from '@/components/dashboard/ui/Icons';
import {
  getBalanceStats,
  getDailyBills,
  getBills,
  formatAmount,
  formatNumber,
  formatDate,
  type BalanceStats,
  type DailyBill,
  type BillItem,
} from '@/lib/payment-api';

/* ============== 柱状图（14天） ============== */

function BarChart({ data, maxHeight = 100 }: { data: DailyBill[]; maxHeight?: number }) {
  if (data.length === 0) return null;
  const displayData = data.slice(-14);
  const maxCost = Math.max(...displayData.map((d) => d.cost), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height: maxHeight }}>
      {displayData.map((d) => {
        const height = Math.max(3, (d.cost / maxCost) * maxHeight);
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
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

/* ============== 账单详情抽屉 ============== */

function BillDetailDrawer({ bill, open, onClose }: { bill: BillItem | null; open: boolean; onClose: () => void }) {
  if (!bill) return null;

  return (
    <Drawer open={open} onClose={onClose} title="账单详情">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">时间</p>
            <p className="text-sm text-gray-800">{formatDate(bill.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">状态</p>
            <Badge variant={getBadgeVariant(bill.statusCode < 400 ? 'success' : 'error')}>
              {bill.statusCode}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">接口</p>
            <p className="text-sm text-gray-800 font-mono">{bill.endpoint}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">模型</p>
            <p className="text-sm text-gray-800 font-mono">{bill.modelId || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">输入 Token</p>
            <p className="text-sm text-gray-800 font-mono">{formatNumber(bill.promptTokens)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">输出 Token</p>
            <p className="text-sm text-gray-800 font-mono">{formatNumber(bill.completionTokens)}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">费用</span>
            <span className="text-lg font-semibold text-gray-900 font-mono">¥{formatAmount(bill.cost)}</span>
          </div>
        </div>

        {bill.channelId && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-1">通道 ID</p>
            <p className="text-sm text-gray-600 font-mono">{bill.channelId.slice(0, 12)}...</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ============== 主页面 ============== */

export default function BillingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [dailyBills, setDailyBills] = React.useState<DailyBill[]>([]);
  const [bills, setBills] = React.useState<BillItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = React.useState('14d');
  const [selectedBill, setSelectedBill] = React.useState<BillItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const days = chartPeriod === '7d' ? 7 : chartPeriod === '14d' ? 14 : 30;
        const [statsData, dailyData] = await Promise.all([
          getBalanceStats(),
          getDailyBills(days),
        ]);
        setStats(statsData);
        setDailyBills(dailyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router, chartPeriod]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const loadBills = async () => {
      try {
        const res = await getBills(page, 20);
        setBills(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        // 静默
      }
    };
    loadBills();
  }, [isAuthenticated, page]);

  const openDetail = (bill: BillItem) => {
    setSelectedBill(bill);
    setDrawerOpen(true);
  };

  // 加载骨架屏
  if (isLoading) {
    return (
      <UserConsoleLayout>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <div className="h-20 bg-gray-50 rounded" />
          </div>
        </div>
      </UserConsoleLayout>
    );
  }

  return (
    <UserConsoleLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {/* 页面标题 + 充值按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">账单中心</h1>
            <p className="text-sm text-gray-500 mt-0.5">查看余额、消费统计和明细</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <IconRefresh size={15} />
              刷新
            </button>
            <Link
              href="/recharge"
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition flex items-center gap-2 shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              充值
            </Link>
          </div>
        </div>

        {/* 余额概览卡片 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">账户余额</h3>
            <Link href="/recharge" className="text-xs text-primary hover:text-primary-600 transition">
              立即充值 →
            </Link>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900 font-mono">
              ¥{formatAmount(stats?.balance.available ?? 0)}
            </span>
            <span className="text-sm text-gray-400 mb-1">可用余额</span>
          </div>
          {stats?.balance.frozen ? (
            <p className="text-xs text-gray-400">
              冻结金额: ¥{formatAmount(stats.balance.frozen)}
            </p>
          ) : null}
        </div>

        {/* KPI 指标卡 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="本月消费"
            value={`¥${formatAmount(stats?.monthlySpend ?? 0)}`}
            subtitle="本月累计"
          />
          <StatCard
            title="本月充值"
            value={`¥${formatAmount(stats?.monthlyRecharge ?? 0)}`}
            subtitle="本月累计"
          />
          <StatCard
            title="本月 Token"
            value={formatNumber(stats?.monthlyTotalTokens ?? 0)}
            subtitle={`提示 ${formatNumber(stats?.monthlyPromptTokens ?? 0)} / 补全 ${formatNumber(stats?.monthlyCompletionTokens ?? 0)}`}
            icon={<IconToken size={14} />}
          />
          <StatCard
            title="本月请求"
            value={formatNumber(stats?.monthlyRequests ?? 0)}
            subtitle="API 调用次数"
          />
        </div>

        {/* 消费趋势 */}
        <div className="mb-6">
          <StatChart
            title="消费趋势"
            periods={[
              { key: '7d', label: '7天' },
              { key: '14d', label: '14天' },
              { key: '30d', label: '30天' },
            ]}
            activePeriod={chartPeriod}
            onChangePeriod={setChartPeriod}
          >
            {dailyBills.length > 0 ? (
              <BarChart data={dailyBills} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">暂无消费数据</p>
            )}
          </StatChart>
        </div>

        {/* 消费明细 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">消费明细</h3>
            <span className="text-xs text-gray-400">共 {total} 条</span>
          </div>

          {bills.length === 0 ? (
            <EmptyState title="暂无消费记录" description="使用 API 后这里会显示消费明细" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="font-normal text-left px-5 py-3.5 text-xs text-gray-500">时间</th>
                      <th className="font-normal text-left px-5 py-3.5 text-xs text-gray-500">模型</th>
                      <th className="font-normal text-left px-5 py-3.5 text-xs text-gray-500">接口</th>
                      <th className="font-normal text-right px-5 py-3.5 text-xs text-gray-500">输入 Token</th>
                      <th className="font-normal text-right px-5 py-3.5 text-xs text-gray-500">输出 Token</th>
                      <th className="font-normal text-right px-5 py-3.5 text-xs text-gray-500">费用</th>
                      <th className="font-normal text-right px-5 py-3.5 text-xs text-gray-500">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => openDetail(b)}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(b.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-700 font-mono text-xs">{b.modelId || '-'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-700 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{b.endpoint}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-right text-gray-600 font-mono">{formatNumber(b.promptTokens)}</td>
                        <td className="px-5 py-3.5 text-sm text-right text-gray-600 font-mono">{formatNumber(b.completionTokens)}</td>
                        <td className="px-5 py-3.5 text-sm text-right text-gray-900 font-mono font-medium">¥{formatAmount(b.cost)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge variant={getBadgeVariant(b.statusCode < 400 ? 'success' : 'error')}>
                            {b.statusCode}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                  <span className="text-xs text-gray-400">第 {page} / {totalPages} 页</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 详情抽屉 */}
      <BillDetailDrawer bill={selectedBill} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </UserConsoleLayout>
  );
}
