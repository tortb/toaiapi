import Link from 'next/link'
import { Zap, Shield, BarChart3, Gift } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      <div className="w-[500px] bg-[var(--accent)] p-12 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-white">◆</span>
          <span className="text-xl font-bold text-white">ToAIAPI</span>
        </Link>
        <div className="mt-8">
          <h1 className="text-4xl font-extrabold text-white">开始构建</h1>
          <h2 className="text-4xl font-extrabold text-[#C7D2FE]">你的 AI 应用</h2>
          <p className="mt-2 text-sm text-[#DDD6FE]">注册即送 ¥5 体验金，无需绑定支付方式即可开始。</p>
        </div>
        <div className="space-y-3 mt-4">
          {[{ icon: Zap, text: '50+ 模型随意调用' }, { icon: Gift, text: '新用户 ¥5 体验金' }, { icon: Shield, text: '无需绑卡，用多少充多少' }].map((f) => {
            const Icon = f.icon
            return <div key={f.text} className="flex items-center gap-2 text-sm text-[#E8E4FF]"><Icon className="w-4 h-4" /><span>{f.text}</span></div>
          })}
        </div>
        <div className="mt-auto text-sm font-medium text-[#DDD6FE]">已有账号？<Link href="/login" className="underline">立即登录</Link></div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-[420px] flex flex-col gap-5">
          <div><h2 className="text-2xl font-bold text-[var(--foreground)]">创建账号</h2><p className="text-sm text-[var(--text-secondary)] mt-1">注册后即可获得 API Key 并开始调用</p></div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">邮箱</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">请输入邮箱地址</div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">验证码</label>
              <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">验证码</div>
            </div>
            <button className="mt-6 px-4 py-2.5 bg-[var(--accent-light)] text-[var(--accent)] text-sm font-medium rounded-md whitespace-nowrap">发送验证码</button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">密码</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">8-128位，含大小写字母和数字</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">邀请码（选填）</label>
            <div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">请输入邀请码</div>
          </div>
          <button className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors">注册</button>
          <div className="flex justify-center gap-1 text-sm"><span className="text-[var(--text-secondary)]">已有账号？</span><Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">立即登录</Link></div>
        </div>
      </div>
    </div>
  )
}
