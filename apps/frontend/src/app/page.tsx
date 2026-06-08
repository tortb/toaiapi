import Link from 'next/link'
import { Zap, Plug, DollarSign, BarChart3, Shield, TrendingUp } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'

const features = [
  { icon: Zap, title: '智能路由', desc: '自动故障转移和负载均衡，基于优先级和权重的智能调度' },
  { icon: Plug, title: '协议兼容', desc: 'OpenAI 兼容接口，无缝对接主流 AI 开发工具和框架' },
  { icon: DollarSign, title: '成本优化', desc: '多供应商竞价策略，自动选择最优价格通道' },
  { icon: BarChart3, title: '用量透明', desc: '详细的调用统计和费用分析，每笔请求都可追溯' },
  { icon: Shield, title: '安全可靠', desc: 'API Key 加密存储，IP 白名单，细粒度权限控制' },
  { icon: TrendingUp, title: '弹性扩展', desc: '自动扩容，支持每秒数万请求的高并发场景' },
]

const stats = [
  { value: '500K+', label: '每日 API 调用' },
  { value: '50+', label: '支持模型' },
  { value: '99.9%', label: '服务可用性' },
  { value: '8', label: 'AI 供应商' },
]

const pricingRows = [
  { model: 'GPT-4o', provider: 'OpenAI', ctx: '128K', input: '¥2.5', output: '¥10' },
  { model: 'Claude 3.5 Sonnet', provider: 'Anthropic', ctx: '200K', input: '¥3', output: '¥15' },
  { model: 'Gemini 1.5 Pro', provider: 'Google', ctx: '1M', input: '¥3.5', output: '¥10.5' },
  { model: 'DeepSeek-V2', provider: 'DeepSeek', ctx: '128K', input: '¥0.5', output: '¥2' },
]

const providers = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Qwen', 'GLM', 'Moonshot', 'Grok']

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="py-20 px-10 text-center relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--accent-light)]/40 blur-3xl pointer-events-none" />
        <div className="max-w-[720px] mx-auto flex flex-col items-center gap-6 relative">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-light)]">
            <Zap className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--accent)]">下一代 AI API 网关</span>
          </div>
          <h1 className="text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
            统一接入最强 AI 模型的 API 平台
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-[600px] leading-relaxed">
            通过 OpenAI 兼容接口，一键接入 Claude、GPT、Gemini、DeepSeek 等主流模型。
            高可用架构，智能路由，用量透明。
          </p>
          <div className="flex items-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/90 transition-all active:scale-[0.98]">
              免费开始 →
            </Link>
            <Link href="/docs" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-[var(--foreground)] border border-[var(--line)] rounded-lg hover:bg-[var(--surface-soft)] transition-colors">
              查看文档
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {providers.map((p) => (
              <span key={p} className="text-sm font-semibold text-[var(--text-muted)]">{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 bg-[var(--surface-soft)]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-[var(--foreground)]">为什么选择 ToAIAPI？</h2>
          <p className="text-base text-[var(--text-secondary)] text-center mb-12">六大核心优势，助力您的 AI 应用</p>
          <div className="grid grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-white border border-[var(--line)] rounded-xl p-6 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 text-[var(--foreground)]">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 text-center">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">平台数据</h2>
          <p className="text-base text-[var(--text-secondary)] mb-12">我们的用户信赖我们</p>
          <div className="flex justify-center gap-8">
            {stats.map((s) => (
              <div key={s.label} className="w-[200px]">
                <div className="text-4xl font-extrabold text-[var(--accent)] mb-1">{s.value}</div>
                <div className="text-sm text-[var(--text-secondary)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 bg-[var(--surface-soft)]">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">透明定价，按量付费</h2>
          <p className="text-base text-[var(--text-secondary)] mb-8">所有模型均按实际 Token 消耗计费，无隐藏费用</p>
          <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden text-left">
            <div className="flex px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
              {['模型', '提供商', '上下文', '输入价格', '输出价格'].map((h) => (
                <div key={h} className="flex-1">{h}</div>
              ))}
            </div>
            {pricingRows.map((row, i) => (
              <div key={row.model} className={`flex px-4 py-3.5 text-sm ${i < pricingRows.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
                <div className="flex-1 font-medium text-[var(--foreground)]">{row.model}</div>
                <div className="flex-1 text-[var(--text-secondary)]">{row.provider}</div>
                <div className="flex-1 text-[var(--text-secondary)]">{row.ctx}</div>
                <div className="flex-1 text-[var(--foreground)]">{row.input}</div>
                <div className="flex-1 text-[var(--foreground)]">{row.output}</div>
              </div>
            ))}
          </div>
          <Link href="/pricing" className="inline-block mt-6 text-sm font-medium text-[var(--accent)] hover:underline">
            查看完整价格方案 →
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
