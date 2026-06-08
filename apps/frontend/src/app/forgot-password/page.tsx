import Link from 'next/link'
import { Lock, Clock, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <div className="w-[500px] bg-[var(--surface-soft)] p-12 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-[var(--accent)]">◆</span>
          <span className="text-xl font-bold text-[var(--foreground)]">ToAIAPI</span>
        </Link>
        <div className="mt-8"><h1 className="text-4xl font-extrabold text-[var(--foreground)]">重置密码</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">忘记密码了？没关系，通过邮箱验证即可重置。</p></div>
        <div className="space-y-3">
          {[{ icon: Lock, text: '安全重置 · 邮箱验证' }, { icon: Clock, text: '链接 30 分钟内有效' }, { icon: Mail, text: '如未收到请检查垃圾邮件箱' }].map((f) => {
            const Icon = f.icon; return <div key={f.text} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Icon className="w-4 h-4 text-[var(--accent)]" /><span>{f.text}</span></div>
          })}
        </div>
        <div className="mt-auto text-xs text-[var(--text-muted)]">© 2026 ToAIAPI</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="w-[400px] flex flex-col gap-6">
          <div><h2 className="text-2xl font-bold text-[var(--foreground)]">忘记密码</h2><p className="text-sm text-[var(--text-secondary)] mt-1">输入注册邮箱，我们将发送重置链接</p></div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">注册邮箱</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">请输入注册邮箱</div>
          </div>
          <button className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors">发送重置链接</button>
          <div className="flex justify-center gap-1 text-sm"><span className="text-[var(--text-secondary)]">想起密码了？</span><Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">返回登录</Link></div>

          <div className="h-px bg-[var(--line)] my-2" />

          <div><h3 className="text-lg font-bold text-[var(--foreground)]">重置密码</h3><p className="text-sm text-[var(--text-secondary)] mt-1">收到邮件后，在此设置新密码</p></div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">新密码</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">至少 8 位</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">确认新密码</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">再次输入新密码</div>
          </div>
          <button className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors">重置密码</button>
        </div>
      </div>
    </div>
  )
}
