import { PublicLayout } from '@/components/layout/public-layout'

const models = [
  ['GPT-4o', 'OpenAI', '128K', '¥2.5', '¥10', '¥1.25', '¥5'],
  ['GPT-4o-mini', 'OpenAI', '128K', '¥0.15', '¥0.6', '¥0.075', '¥0.3'],
  ['Claude 3.5 Sonnet', 'Anthropic', '200K', '¥3', '¥15', '¥1.5', '¥7.5'],
  ['Claude 3 Haiku', 'Anthropic', '200K', '¥0.25', '¥1.25', '¥0.125', '-'],
  ['Gemini 2.0 Flash', 'Google', '1M', '¥0.1', '¥0.4', '¥0.05', '-'],
  ['Gemini 1.5 Pro', 'Google', '2M', '¥3.5', '¥10.5', '¥1.75', '-'],
  ['DeepSeek-V2', 'DeepSeek', '128K', '¥0.5', '¥2', '¥0.25', '-'],
  ['Qwen-Max', 'Qwen', '32K', '¥2', '¥6', '¥1', '-'],
]

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-10 py-16">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">价格方案</h1><p className="mt-2 text-base text-[var(--text-secondary)]">所有价格单位为「分/百万 Token」，按实际用量计费</p></div>
        <div className="flex gap-1 mb-4">
          {['全部模型', 'OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Qwen'].map((t, i) => (
            <button key={t} className={`px-4 py-2 text-sm rounded-md ${i === 0 ? 'bg-[var(--accent)] text-white font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'}`}>{t}</button>
          ))}
        </div>
        <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="flex px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
            {['模型', '提供商', '上下文', '输入价格', '输出价格', '缓存价格', '推理价格'].map((h) => (
              <div key={h} className="flex-1">{h}</div>
            ))}
          </div>
          {models.map((m, i) => (
            <div key={m[0]} className={`flex px-4 py-3.5 text-sm ${i < models.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
              <div className="flex-1 font-medium text-[var(--foreground)]">{m[0]}</div>
              <div className="flex-1 text-[var(--text-secondary)]">{m[1]}</div>
              <div className="flex-1 text-[var(--text-secondary)]">{m[2]}</div>
              <div className="flex-1 text-[var(--foreground)]">{m[3]}</div>
              <div className="flex-1 text-[var(--foreground)]">{m[4]}</div>
              <div className="flex-1 text-[var(--foreground)]">{m[5]}</div>
              <div className="flex-1 text-[var(--foreground)]">{m[6]}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12"><h2 className="text-2xl font-semibold text-[var(--foreground)]">准备好开始了吗？</h2><p className="text-sm text-[var(--text-secondary)] mt-2 mb-6">注册即送 ¥5 体验金，立即体验所有模型</p>
          <a href="/register" className="inline-flex px-8 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--accent)]/90 transition-colors">免费注册 →</a>
        </div>
      </div>
    </PublicLayout>
  )
}
