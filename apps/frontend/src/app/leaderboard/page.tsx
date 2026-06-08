import { PublicLayout } from '@/components/layout/public-layout'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const rankings = [
  ['#1', 'GPT-4o', 'OpenAI', '50.2K', '20.1M', 'up'],
  ['#2', 'Claude 3.5 Sonnet', 'Anthropic', '35.1K', '15.3M', 'down'],
  ['#3', 'Gemini 2.0 Flash', 'Google', '28.7K', '12.8M', 'up'],
  ['#4', 'DeepSeek-V2', 'DeepSeek', '22.4K', '8.5M', 'neutral'],
  ['#5', 'Qwen-Max', 'Qwen', '18.9K', '6.2M', 'down'],
]

const shares = [['OpenAI', '38%', '#2383E2'], ['Anthropic', '24%', '#2E7D32'], ['Google', '18%', '#2563EB'], ['DeepSeek', '12%', '#D97706'], ['其他', '8%', '#BAB9B5']]

export default function LeaderboardPage() {
  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-10 py-16">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">模型排行榜</h1><p className="mt-2 text-base text-[var(--text-secondary)]">热门模型排名、提供商份额和趋势分析</p></div>
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex gap-1 mb-4">{['今日', '本周', '本月', '今年', '全部'].map((t, i) => (
              <button key={t} className={`px-3 py-1.5 text-sm rounded-md ${i === 1 ? 'bg-[var(--accent)] text-white font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'}`}>{t}</button>
            ))}</div>
            <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
              <div className="flex px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
                {['排名', '模型', '提供商', '请求数', 'Token', '趋势'].map((h) => <div key={h} className="flex-1">{h}</div>)}
              </div>
              {rankings.map((r) => (
                <div key={r[0]} className="flex px-4 py-3.5 text-sm border-b border-[var(--line)] last:border-b-0 items-center">
                  <div className="flex-1 font-bold text-[var(--accent)]">{r[0]}</div>
                  <div className="flex-1 font-medium text-[var(--foreground)]">{r[1]}</div>
                  <div className="flex-1 text-[var(--text-secondary)]">{r[2]}</div>
                  <div className="flex-1 text-[var(--foreground)]">{r[3]}</div>
                  <div className="flex-1 text-[var(--foreground)]">{r[4]}</div>
                  <div className="flex-1">{r[5] === 'up' ? <TrendingUp className="w-4 h-4 text-[var(--success)]" /> : r[5] === 'down' ? <TrendingDown className="w-4 h-4 text-[var(--danger)]" /> : <Minus className="w-4 h-4 text-[var(--text-muted)]" />}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-[360px] space-y-6">
            <div className="bg-white border border-[var(--line)] rounded-xl p-6">
              <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">提供商市场份额</h3>
              <div className="space-y-3">{shares.map((s) => (
                <div key={s[0]} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s[2] }} />
                  <span className="text-sm text-[var(--text-secondary)] flex-1">{s[0]}</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{s[1]}</span>
                </div>
              ))}</div>
            </div>
            <div className="bg-white border border-[var(--line)] rounded-xl p-6">
              <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]"><TrendingUp className="w-4 h-4 inline mr-1" />上升趋势</h3>
              {[['Gemini 2.0 Flash', '+35%'], ['DeepSeek-V2', '+28%'], ['Claude 3.5 Sonnet', '+12%']].map(([m, p]) => (
                <div key={m} className="flex items-center gap-2 py-2 border-b border-[var(--line)] last:border-b-0">
                  <span className="text-sm text-[var(--foreground)] flex-1">{m}</span>
                  <span className="text-sm font-semibold text-[var(--success)]">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
