import Link from 'next/link'
import { Zap, Shield, BarChart3 } from 'lucide-react'

const features = [
  { icon: Zap, text: '高可用架构 · 智能故障转移' },
  { icon: Shield, text: '企业级安全 · 加密传输' },
  { icon: BarChart3, text: '用量透明 · 每笔可追溯' },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="w-[500px] bg-[var(--surface-soft)] p-12 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-[var(--accent)]">◆</span>
          <span className="text-xl font-bold text-[var(--foreground)]">ToAIAPI</span>
        </Link>
        <div className="mt-8">
          <h1 className="text-4xl font-extrabold text-[var(--foreground)]">欢迎回来</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-[380px]">
            通过 OpenAI 兼容接口，一键接入 Claude、GPT、Gemini、DeepSeek 等主流模型。
          </p>
        </div>
        <div className="space-y-3 mt-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.text} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Icon className="w-4 h-4 text-[var(--accent)]" />
                <span>{f.text}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-auto text-xs text-[var(--text-muted)]">© 2026 ToAIAPI</div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-[400px] flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">登录</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">登录您的账户以继续使用 ToAIAPI</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">邮箱</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">请输入邮箱地址</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">密码</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">请输入密码</div>
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[var(--accent)] font-medium hover:underline">忘记密码？</Link>
          </div>
          <button className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors">登录</button>
          <div className="flex justify-center gap-1 text-sm">
            <span className="text-[var(--text-secondary)]">还没有账号？</span>
            <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">立即注册</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
