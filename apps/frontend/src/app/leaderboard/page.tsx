import { PublicLayout } from "@/components/layout/public-layout";
import { getLeaderboard } from "@/lib/user-api";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

function formatNumber(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return value.toLocaleString("zh-CN");
}

function TrendIcon({ change }: { change: number }) {
  if (change > 0) return <TrendingUp className="w-4 h-4 text-[var(--success)]" />;
  if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-[var(--text-muted)]" />;
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard("week").catch(() => ({ hotModels: [], leaderboard: [], marketShare: [], rising: [], falling: [] }));
  const rows = data.leaderboard.length > 0 ? data.leaderboard : data.hotModels;

  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">模型排行榜</h1><p className="mt-2 text-base text-[var(--text-secondary)]">热门模型排名、提供商份额和趋势分析</p></div>
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            <div className="flex gap-1 mb-4">{["本周", "本月", "今年", "全部"].map((item, index) => (
              <span key={item} className={`px-3 py-1.5 text-sm rounded-md ${index === 0 ? "bg-[var(--accent)] text-white font-medium" : "text-[var(--text-secondary)] bg-[var(--surface-soft)]"}`}>{item}</span>
            ))}</div>
            <div className="bg-white border border-[var(--line)] rounded-lg overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-6 px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
                  {["排名", "模型", "提供商", "请求数", "Token", "趋势"].map((header) => <div key={header}>{header}</div>)}
                </div>
                {rows.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">暂无排行榜数据</div>
                ) : rows.map((row) => (
                  <div key={`${row.rank}-${row.model}`} className="grid grid-cols-6 px-4 py-3.5 text-sm border-b border-[var(--line)] last:border-b-0 items-center">
                    <div className="font-bold text-[var(--accent)]">#{row.rank}</div>
                    <div className="font-medium text-[var(--foreground)] truncate pr-3">{row.model}</div>
                    <div className="text-[var(--text-secondary)] truncate pr-3">{row.vendor}</div>
                    <div className="text-[var(--foreground)]">{formatNumber(row.requests)}</div>
                    <div className="text-[var(--foreground)]">{formatNumber(row.tokens)}</div>
                    <div><TrendIcon change={row.change} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="xl:w-[360px] space-y-6">
            <div className="bg-white border border-[var(--line)] rounded-lg p-6">
              <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">提供商市场份额</h3>
              <div className="space-y-3">
                {data.marketShare.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">暂无份额数据</p> : data.marketShare.map((share) => (
                  <div key={share.vendor} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-secondary)] flex-1">{share.vendor}</span>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{share.percentage ? `${share.percentage}%` : formatNumber(share.tokens)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[var(--line)] rounded-lg p-6">
              <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]"><TrendingUp className="w-4 h-4 inline mr-1" />上升趋势</h3>
              {data.rising.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">暂无趋势数据</p> : data.rising.map((item) => (
                <div key={item.model} className="flex items-center gap-2 py-2 border-b border-[var(--line)] last:border-b-0">
                  <span className="text-sm text-[var(--foreground)] flex-1 truncate">{item.model}</span>
                  <span className="text-sm font-semibold text-[var(--success)]">+{item.change}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
