'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { DataCard } from '@/components/data-card';
import { ErrorAlert } from '@/components/error-alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Server, Radio, Cpu, Zap, Hash } from 'lucide-react';
import type { DashboardStats } from '@/types';

/**
 * Admin 仪表盘首页
 *
 * 展示平台核心统计指标：用户、Provider、渠道、模型数量
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.dashboard.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="mt-4 h-8 w-24" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <div>
        <h3 className="text-lg font-semibold text-foreground">概览</h3>
        <p className="text-sm text-muted-foreground">平台核心数据一览</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="用户总数"
          value={stats?.userCount ?? 0}
          icon={Users}
          description="注册用户"
        />
        <DataCard
          title="Provider"
          value={stats?.providerCount ?? 0}
          icon={Server}
          description="AI 服务商"
        />
        <DataCard
          title="渠道"
          value={stats?.channelCount ?? 0}
          icon={Radio}
          description="API 渠道"
        />
        <DataCard
          title="模型"
          value={stats?.modelCount ?? 0}
          icon={Cpu}
          description="可用模型"
        />
      </div>
    </div>
  );
}
