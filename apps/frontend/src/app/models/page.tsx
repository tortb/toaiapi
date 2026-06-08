import { PublicLayout } from '@/components/layout/public-layout'
import { Search, Zap, Wrench, Eye } from 'lucide-react'

const models = [
  [{ name: 'GPT-4o', provider: 'OpenAI', ctx: '128K', price: '¥2.5 / ¥10', tags: ['流式', '工具', '视觉'], color: '#10B981' },
   { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', ctx: '200K', price: '¥3 / ¥15', tags: ['流式', '工具', '视觉'], color: '#2383E2' },
   { name: 'Gemini 2.0 Flash', provider: 'Google', ctx: '1M', price: '¥0.1 / ¥0.4', tags: ['流式', '工具', '视觉'], color: '#2563EB' },
   { name: 'DeepSeek-V2', provider: 'DeepSeek', ctx: '128K', price: '¥0.5 / ¥2', tags: ['流式', '工具'], color: '#D97706' }],
  [{ name: 'Qwen-Max', provider: 'Qwen', ctx: '32K', price: '¥2 / ¥6', tags: ['流式', '工具', '视觉'], color: '#059669' },
   { name: 'GLM-4', provider: 'GLM', ctx: '128K', price: '¥1 / ¥2', tags: ['流式', '工具'], color: '#DC2626' },
   { name: 'Moonshot-v1', provider: 'Moonshot', ctx: '128K', price: '¥1.5 / ¥4.5', tags: ['流式', '工具'], color: '#7C3AED' },
   { name: 'Grok-2', provider: 'Grok', ctx: '128K', price: '¥2 / ¥8', tags: ['流式', '工具'], color: '#2563EB' }],
]

export default function ModelsPage() {
  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-10 py-16">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">模型广场</h1><p className="mt-2 text-base text-[var(--text-secondary)]">浏览所有可用 AI 模型，选择最适合您需求的模型</p></div>
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[var(--line)] rounded-md w-[280px]">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-muted)]">搜索模型名称...</span>
          </div>
          {['全部', 'OpenAI', 'Anthropic', 'Google', 'DeepSeek'].map((f, i) => (
            <button key={f} className={`px-4 py-1.5 text-sm rounded-full border ${i === 0 ? 'bg-[var(--accent)] text-white border-transparent' : 'border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'}`}>{f}</button>
          ))}
          <div className="flex-1" />
          <div className="flex gap-2">{['流式', '工具调用', '视觉'].map((t) => (
            <button key={t} className="px-3 py-1.5 text-xs rounded-full border border-[var(--line)] text-[var(--text-secondary)]">{t}</button>
          ))}</div>
        </div>
        {models.map((row, ri) => (
          <div key={ri} className="flex gap-5 mb-5">
            {row.map((m) => (
              <div key={m.name} className="flex-1 bg-white border border-[var(--line)] rounded-xl p-6 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{m.name}</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{m.provider} · {m.ctx} context</p>
                <div className="flex gap-2 mb-3">{m.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs bg-[var(--surface-soft)] text-[var(--text-secondary)] rounded">{t}</span>
                ))}</div>
                <p className="text-sm font-medium text-[var(--foreground)]">输入 {m.price.split(' / ')[0]} / 输出 {m.price.split(' / ')[1]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PublicLayout>
  )
}
