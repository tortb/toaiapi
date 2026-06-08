import { PublicLayout } from '@/components/layout/public-layout'
import { Circle } from 'lucide-react'

const channels = [
  ['OpenAI', 'openai-main', 'ACTIVE', '245ms', '152.3K', '0.02%'],
  ['OpenAI', 'openai-eu', 'ACTIVE', '312ms', '89.1K', '0.03%'],
  ['Anthropic', 'anthropic-main', 'ACTIVE', '412ms', '98.7K', '0.01%'],
  ['Google', 'google-main', 'RATE_LIMITED', '523ms', '45.2K', '0.15%'],
  ['DeepSeek', 'deepseek-main', 'ACTIVE', '189ms', '67.8K', '0.05%'],
]

export default function StatusPage() {
  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-10 py-16">
        <div className="mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">服务状态</h1><p className="mt-2 text-base text-[var(--text-secondary)]">各渠道实时运行状态和性能指标</p></div>
        <div className="flex items-center gap-4 p-5 mb-6 bg-[var(--success-bg)] rounded-xl">
          <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
          <span className="text-base font-semibold text-[var(--success)]">所有系统运行正常</span>
          <span className="text-sm text-[var(--text-secondary)] flex-1 text-right">12 个渠道在线 · 0 个异常</span>
        </div>
        <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="flex px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
            {['提供商', '渠道', '状态', '平均延迟', '总请求数', '失败率'].map((h) => <div key={h} className="flex-1">{h}</div>)}
          </div>
          {channels.map((ch) => (
            <div key={ch[1]} className="flex px-4 py-3.5 text-sm items-center border-b border-[var(--line)] last:border-b-0">
              <div className="flex-1 text-[var(--foreground)]">{ch[0]}</div>
              <div className="flex-1 text-[var(--text-secondary)]">{ch[1]}</div>
              <div className="flex-1 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${ch[2] === 'ACTIVE' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`} />
                <span className={ch[2] === 'ACTIVE' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>{ch[2] === 'ACTIVE' ? '正常' : '限流'}</span>
              </div>
              <div className="flex-1 text-[var(--foreground)]">{ch[3]}</div>
              <div className="flex-1 text-[var(--foreground)]">{ch[4]}</div>
              <div className="flex-1 text-[var(--text-secondary)]">{ch[5]}</div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
