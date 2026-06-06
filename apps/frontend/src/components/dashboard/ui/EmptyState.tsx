'use client';

import React from 'react';
import { IconEmpty } from '@/components/dashboard/ui/Icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * EmptyState — 空状态占位
 *
 * 用于列表无数据时展示。
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        {icon || <IconEmpty size={22} />}
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      {description && <p className="text-xs text-gray-400 mb-4">{description}</p>}
      {action}
    </div>
  );
}
