import Link from 'next/link'
import { Users, Bot, DollarSign, Settings } from 'lucide-react'

const features = [
  { icon: Users, text: '用户与权限管理' },
  { icon: Bot, text: '模型与通道管理' },
  { icon: DollarSign, text: '财务与订单管理' },
  { icon: Settings, text: '系统配置管理' },
]

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="w-[500px] bg-[var(--surface-soft)] p-12 flex flex-col gap-6">
        <div className="flex items-center gap-2"><span className="text-2xl text-[var(--accent)]">◆</span><span className="text-xl font-bold text-[var(--foreground)]">ToAIAPI Admin</span></div>
        <div className="mt-8"><h1 className="text-4xl font-extrabold text-[var(--foreground)]">管理控制台</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">系统管理与运营配置中心</p></div>
        <div className="space-y-3">
          {features.map((f) => {
            const Icon = f.icon
            return <div key={f.text} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Icon className="w-4 h-4 text-[var(--accent)]" /><span>{f.text}</span></div>
          })}
        </div>
        <div className="mt-auto text-xs text-[var(--text-muted)]">仅限管理员访问</div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-[400px] flex flex-col gap-6">
          <div><h2 className="text-2xl font-bold text-[var(--foreground)]">管理员登录</h2><p className="text-sm text-[var(--text-secondary)] mt-1">请输入管理员账号和密码</p></div>
          <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--foreground)]">管理员邮箱</label><div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">admin@toaiapi.com</div></div>
          <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--foreground)]">密码</label><div className="px-3 py-2.5 bg-white border border-[var(--line)] rounded-md text-sm text-[var(--text-muted)]">请输入密码</div></div>
          <button className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-md hover:bg-[var(--accent)]/90 transition-colors">登录管理后台</button>
        </div>
      </div>
    </div>
  )
}
