'use client';

import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
  error: { bg: 'bg-error/8', text: 'text-error', dot: 'bg-error' },
  warning: { bg: 'bg-warning/8', text: 'text-warning', dot: 'bg-warning' },
  info: { bg: 'bg-info/8', text: 'text-info', dot: 'bg-info' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

/**
 * Badge — 状态标签
 *
 * 用于表格中的状态列、标签展示。
 * 支持带圆点指示器。
 */
export default function Badge({ variant, children, dot = true }: BadgeProps) {
  const s = VARIANT_STYLES[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.text}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
      {children}
    </span>
  );
}

/**
 * getBadgeVariant — 从状态值映射到 Badge 变体
 */
export function getBadgeVariant(status: string): BadgeVariant {
  const s = status.toLowerCase();
  if (['success', 'completed', 'enabled', 'active', 'paid'].includes(s)) return 'success';
  if (['error', 'failed', 'disabled', 'inactive', 'expired'].includes(s)) return 'error';
  if (['pending', 'processing', 'refunding'].includes(s)) return 'warning';
  if (['info', 'refunded', 'cancelled'].includes(s)) return 'info';
  return 'neutral';
}
