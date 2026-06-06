'use client';

/**
 * 使用统计
 *
 * /dashboard/usage — Token 消耗趋势、模型占比、成本统计
 */

import React from 'react';
import UserConsoleLayout from '@/components/dashboard/layout/UserConsoleLayout';
import StatCard from '@/components/dashboard/ui/StatCard';
import StatChart from '@/components/dashboard/ui/StatChart';
import { IconToken, IconRefresh } from '@/components/dashboard/ui/Icons';

/* ============== 模型分布数据 ============== */

interface ModelUsage {
  name: string;
  percentage: number;
  tokens: number;
  cost: number;
  color: string;
}

const MOCK_MODELS: ModelUsage[] = [
  { name: 'GPT-4o', percentage: 42, tokens: 37_500_000, cost: 187.50, color: '#2962FF' },
  { name: 'Claude Sonnet', percentage: 28, tokens: 25_000_000, cost: 150.00, color: '#9C27B0' },
  { name: 'GPT-4o-mini', percentage: 18, tokens: 16_000_000, cost: 24.00, color: '#03A9F4' },
  { name: 'Gemini Pro', percentage: 8, tokens: 7_200_000, cost: 10.80, color: '#10B981' },
  { name: '其他', percentage: 4, tokens: 3_600_000, cost: 5.40, color: '#9CA3AF' },
];

/* ============== 模拟趋势数据（30天） ============== */

function generateTrendData(days: number): { day: string; tokens: number }[] {
  const data: { day: string; tokens: number }[] = [];
  const base = 800_000;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      tokens: base + Math.floor(Math.random() * 400_000),
    });
  }
  return data;
}

/* ============== 简易折线图 ============== */

function Sparkline({ data, height = 60 }: { data: { day: string; tokens: number }[]; height?: number }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.tokens), 1);
  const w = 100 / data.length;

  return (
    <div className="relative" style={{ height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${data.length * 10} ${height}`}
        className="overflow-visible"
      >
        {/* 面积填充 */}
        <path
          d={`M0,${height} ${data.map((d, i) => `L${i * 10 + 5},${height - (d.tokens / maxVal) * (height - 8) - 4}`).join(' ')} L${(data.length - 1) * 10 + 5},${height} Z`}
          fill="url(#gradient)"
          opacity={0.15}
        />
        {/* 折线 */}
        <path
          d={`M5,${height - (data[0].tokens / maxVal) * (height - 8) - 4} ${data.map((d, i) => `L${i * 10 + 5},${height - (d.tokens / maxVal) * (height - 8) - 4}`).join(' ')}`}
          fill="none"
          stroke="#2962FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 终点圆点 */}
        <circle
          cx={(data.length - 1) * 10 + 5}
          cy={height - (data[data.length - 1].tokens / maxVal) * (height - 8) - 4}
          r="3"
          fill="#2962FF"
          stroke="white"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2962FF" />
            <stop offset="1" stopColor="#2962FF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* X 轴标签 */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{data[0]?.day}</span>
        <span className="text-[10px] text-gray-400">{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */

export default function UsagePage() {
  const [period, setPeriod] = React.useState('30d');
  const [trendData] = React.useState(() => generateTrendData(30));
  const [models] = React.useState(MOCK_MODELS);

  const totalTokens = models.reduce((s, m) => s + m.tokens, 0);
  const totalCost = models.reduce((s, m) => s + m.cost, 0);

  return (
    <UserConsoleLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">使用统计</h1>
            <p className="text-sm text-gray-500 mt-0.5">查看 Token 消耗、请求量和模型占比</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <IconRefresh size={15} />
            刷新
          </button>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="本月 Token"
            value={(totalTokens / 1_000_000).toFixed(1) + 'M'}
            subtitle="总计"
            icon={<IconToken size={14} />}
          />
          <StatCard
            title="本月请求"
            value="156,230"
            subtitle="日均 5,207"
          />
          <StatCard
            title="预估费用"
            value={`¥${totalCost.toFixed(2)}`}
            trend={{ up: true, pct: '+12.5%' }}
          />
          <StatCard
            title="平均延迟"
            value="342ms"
            subtitle="P99: 1.2s"
            trend={{ up: false, pct: '8.3%' }}
          />
        </div>

        {/* Token 趋势 */}
        <div className="mb-6">
          <StatChart
            title="Token 消耗趋势"
            periods={[
              { key: '7d', label: '7天' },
              { key: '30d', label: '30天' },
              { key: '90d', label: '90天' },
            ]}
            activePeriod={period}
            onChangePeriod={setPeriod}
          >
            <Sparkline data={trendData} />
          </StatChart>
        </div>

        {/* 模型分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 模型占比 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-4">模型占比</h3>
            <div className="space-y-3">
              {models.map((m) => (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-sm text-gray-700">{m.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 font-mono">{m.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 成本分布 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-4">成本分布</h3>
            <div className="space-y-2">
              {models.map((m) => (
                <div key={m.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-sm text-gray-700">{m.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 font-mono">¥{m.cost.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-2 font-mono">{(m.tokens / 1_000_000).toFixed(1)}M tokens</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">合计</span>
                <span className="text-sm font-bold text-primary font-mono">¥{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 数据说明 */}
        <p className="text-xs text-gray-400 mt-4">
          ⚡ 当前展示为示例数据，接入完整统计接口后数据将自动更新
        </p>
      </div>
    </UserConsoleLayout>
  );
}
