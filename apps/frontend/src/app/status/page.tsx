import { PublicLayout } from "@/components/layout/public-layout";
import { getStatus } from "@/lib/api";

function formatNumber(value?: number) {
  if (!value) return "0";
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return value.toLocaleString("zh-CN");
}

export default async function StatusPage() {
  const channels = await getStatus().catch(() => []);
  const healthyCount = channels.filter((channel) => channel.healthy).length;
  const failedCount = channels.length - healthyCount;

  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
        <div className="mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">服务状态</h1><p className="mt-2 text-base text-[var(--text-secondary)]">各渠道实时运行状态和性能指标</p></div>
        <div className={`flex items-center gap-4 p-5 mb-6 rounded-lg ${failedCount === 0 ? "bg-[var(--success-bg)]" : "bg-[var(--warning-bg)]"}`}>
          <div className={`w-3 h-3 rounded-full ${failedCount === 0 ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} />
          <span className={`text-base font-semibold ${failedCount === 0 ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>{failedCount === 0 ? "所有系统运行正常" : "部分渠道需要关注"}</span>
          <span className="text-sm text-[var(--text-secondary)] flex-1 text-right">{healthyCount} 个渠道在线 · {failedCount} 个异常</span>
        </div>
        <div className="bg-white border border-[var(--line)] rounded-lg overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-6 px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
              {["提供商", "渠道", "状态", "平均延迟", "总请求数", "失败率"].map((header) => <div key={header}>{header}</div>)}
            </div>
            {channels.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">暂无渠道状态数据</div>
            ) : channels.map((channel) => (
              <div key={`${channel.provider || ""}-${channel.name}`} className="grid grid-cols-6 px-4 py-3.5 text-sm items-center border-b border-[var(--line)] last:border-b-0">
                <div className="text-[var(--foreground)] truncate pr-3">{channel.provider || "-"}</div>
                <div className="text-[var(--text-secondary)] truncate pr-3">{channel.channel || channel.name}</div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${channel.healthy ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} />
                  <span className={channel.healthy ? "text-[var(--success)]" : "text-[var(--warning)]"}>{channel.healthy ? "正常" : channel.status || "异常"}</span>
                </div>
                <div className="text-[var(--foreground)]">{channel.avgLatencyMs == null ? "-" : `${channel.avgLatencyMs}ms`}</div>
                <div className="text-[var(--foreground)]">{formatNumber(channel.totalRequests)}</div>
                <div className="text-[var(--text-secondary)]">{channel.failureRate == null ? "-" : `${channel.failureRate}%`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
