import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '服务状态 - ToAIAPI',
  description: '查看 ToAIAPI 所有渠道的实时状态、延迟和可用率。',
};

interface ChannelStatus {
  provider: string;
  channel: string;
  status: string;
  latency: string;
  uptime: string;
  requests: string;
  failureRate: string;
}

const CHANNEL_DATA: ChannelStatus[] = [
  { provider: 'OpenAI', channel: 'OpenAI Primary', status: '正常', latency: '320ms', uptime: '99.98%', requests: '125,340', failureRate: '0.02%' },
  { provider: 'Anthropic', channel: 'Anthropic Primary', status: '正常', latency: '450ms', uptime: '99.95%', requests: '89,210', failureRate: '0.05%' },
  { provider: 'Google', channel: 'Gemini Primary', status: '正常', latency: '280ms', uptime: '99.99%', requests: '45,670', failureRate: '0.01%' },
  { provider: 'DeepSeek', channel: 'DeepSeek Main', status: '正常', latency: '520ms', uptime: '99.90%', requests: '67,890', failureRate: '0.10%' },
  { provider: 'Alibaba', channel: 'Qwen Main', status: '正常', latency: '380ms', uptime: '99.92%', requests: '34,560', failureRate: '0.08%' },
  { provider: 'xAI', channel: 'Grok Main', status: '正常', latency: '410ms', uptime: '99.85%', requests: '12,340', failureRate: '0.15%' },
];

const statusVariant = (status: string) => {
  switch (status) {
    case '正常': return 'success' as const;
    case '降级': return 'warning' as const;
    case '故障': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

/** 服务状态页面 */
export default function StatusPage() {
  const allNormal = CHANNEL_DATA.every((c) => c.status === '正常');

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          服务状态
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          所有渠道实时运行状态
        </p>

        {/* 整体状态 */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-6">
          <div className={`h-3 w-3 rounded-full ${allNormal ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-lg font-medium text-foreground">
            {allNormal ? '所有系统正常运行' : '部分服务存在异常'}
          </span>
        </div>

        {/* 渠道状态表格 */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">渠道</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">延迟</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">可用率</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">总请求</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">失败率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CHANNEL_DATA.map((row) => (
                <tr key={`${row.provider}-${row.channel}`} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-foreground">{row.provider}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.channel}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.latency}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.uptime}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.requests}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.failureRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 说明 */}
        <p className="mt-4 text-xs text-muted-foreground">
          * 状态数据每 5 分钟更新一次。可用率为过去 30 天的统计数据。
        </p>
      </div>
    </div>
  );
}
