'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    up: boolean;
    pct: string;
  };
  icon?: React.ReactNode;
}

/**
 * StatCard — KPI 指标卡
 *
 * 白色圆角卡片，展示关键数据指标。
 * 支持趋势指示（上升/下降）和图标。
 *
 * 参考 Stripe Dashboard 的 Stat 风格。
 */
export default function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-medium text-gray-500 tracking-wide">{title}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend.up ? 'text-success' : 'text-error'
            }`}
          >
            {/* 趋势箭头 */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {trend.up ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
            {trend.pct}
          </span>
        )}
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}
