'use client';

import React from 'react';
import { IconWarning } from '@/components/dashboard/ui/Icons';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — React 错误边界
 *
 * 捕获子组件抛出的渲染错误，展示友好的错误提示。
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error mb-4">
            <IconWarning size={24} />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">页面渲染异常</p>
          <p className="text-xs text-gray-400 mb-4 text-center max-w-sm">
            {this.state.error?.message || '发生了意外的错误，请刷新页面重试'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
