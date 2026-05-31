'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { DataCard } from '@/components/data-card';
import { ErrorAlert } from '@/components/error-alert';
import { Users, Server, Radio, Cpu, Zap, Hash } from 'lucide-react';
import type { DashboardStats } from '@/types';

/** Admin 仪表盘首页 */
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DataCard title="用户总数" value={stats?.userCount ?? 0} icon={Users} />
        <DataCard title="Provider" value={stats?.providerCount ?? 0} icon={Server} />
        <DataCard title="渠道" value={stats?.channelCount ?? 0} icon={Radio} />
        <DataCard title="模型" value={stats?.modelCount ?? 0} icon={Cpu} />
        <DataCard title="今日请求" value={stats?.todayRequests ?? 0} icon={Zap} description="开发中" />
        <DataCard title="今日 Token" value={stats?.todayTokens ?? 0} icon={Hash} description="开发中" />
      </div>
    </div>
  );
}
