'use client';

import React from 'react';

interface Period {
  key: string;
  label: string;
}

interface StatChartProps {
  title: string;
  periods: Period[];
  activePeriod: string;
  onChangePeriod: (key: string) => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * StatChart — 趋势图容器
 *
 * 标题 + 时间段切换 + 内容区。
 * 时间段切换如 [24小时] [7天] [30天]。
 */
export default function StatChart({
  title,
  periods,
  activePeriod,
  onChangePeriod,
  children,
  action,
}: StatChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {/* 时间段切换 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => onChangePeriod(p.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  activePeriod === p.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {action}
        </div>
      </div>
      <div className="px-6 pb-5">{children}</div>
    </div>
  );
}
