'use client'

import Link from 'next/link'
import { LayoutDashboard, Key, BarChart3, TrendingUp, Wallet, FileText, ScrollText, Banknote, Gift, CalendarCheck, Settings, Bell, RotateCcw, BookOpen, LogOut, Zap } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: '概览', href: '/dashboard' },
  { icon: Key, label: 'API 密钥', href: '/dashboard/apikeys' },
  { icon: BarChart3, label: '使用统计', href: '/dashboard/usage' },
  { icon: TrendingUp, label: '分析看板', href: '/dashboard/analytics' },
  { icon: Wallet, label: '账单中心', href: '/dashboard/billing' },
  { icon: FileText, label: '消费明细', href: '/dashboard/bills' },
  { icon: ScrollText, label: '请求日志', href: '/dashboard/logs' },
  { icon: Banknote, label: '充值中心', href: '/dashboard/recharge' },
  { icon: Gift, label: '邀请奖励', href: '/dashboard/invite' },
  { icon: CalendarCheck, label: '每日签到', href: '/dashboard/checkin' },
  { icon: Settings, label: '个人设置', href: '/dashboard/settings' },
  { icon: Bell, label: '通知设置', href: '/dashboard/settings/notifications' },
]

const statCards = [
  { icon: Wallet, label: '账户余额', value: '¥1,284.50', sub: '可用：¥1,234.50' },
  { icon: BarChart3, label: '今日请求', value: '1,847 次', sub: '消费 ¥32.50' },
  { icon: TrendingUp, label: '今日 Token', value: '284.5K 输入', sub: '156.2K 输出' },
  { icon: Zap, label: '性能', value: '45 RPM', sub: '平均延迟 234ms' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-[260px] min-h-screen bg-[var(--surface-soft)] border-r border-[var(--line)] flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--line)]">
          <span className="text-xl text-[var(--accent)]">◆</span>
          <span className="text-base font-bold text-[var(--foreground)]">ToAIAPI</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--line)] bg-[var(--surface-hover)]">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-semibold flex items-center justify-center text-xs">张</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)] truncate">张三</div>
            <div className="text-xs text-[var(--text-muted)]">普通用户</div>
          </div>
        </div>
        <div className="px-3 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">导航菜单</div>
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors duration-150 ${isActive ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-3 pb-4 border-t border-[var(--line)] pt-3 space-y-0.5">
          <Link href="/docs" className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors">
            <BookOpen className="w-4 h-4" /><span>API 文档</span>
          </Link>
          <button className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors w-full text-left">
            <LogOut className="w-4 h-4" /><span>退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#FAFAFA] p-8">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">用量概览</h1>
          <span className="text-sm text-[var(--text-muted)] flex-1">欢迎回来，张三</span>
          <div className="flex gap-2">
            {([['近7天', true], ['近30天', false], ['近90天', false]] as [string, boolean][]).map(([label, active]) => (
              <button key={label} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${active ? 'bg-[var(--accent)] text-white font-medium' : 'border border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'}`}>{label}</button>
            ))}
          </div>
          <RotateCcw className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--foreground)] cursor-pointer" />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white border border-[var(--line)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[var(--foreground)] mb-1">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)]">{s.sub}</div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-6 mb-6">
          <div className="flex-1 bg-white border border-[var(--line)] rounded-lg p-6">
            <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">Token 使用趋势</h3>
            <div className="h-[260px] bg-[var(--surface-soft)] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
          </div>
          <div className="w-[340px] bg-white border border-[var(--line)] rounded-lg p-6">
            <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">模型分布 Top 5</h3>
            {[['GPT-4o', 'OpenAI', '48%'], ['Claude 3.5', 'Anthropic', '22%'], ['Gemini', 'Google', '15%'], ['DeepSeek', 'DeepSeek', '10%'], ['其他', '-', '5%']].map(([m, p, pc]) => (
              <div key={m} className="flex items-center gap-3 py-2 border-b border-[var(--line)] last:border-b-0">
                <span className="text-sm text-[var(--foreground)] flex-1">{m}</span>
                <span className="text-xs text-[var(--text-muted)] w-20">{p}</span>
                <span className="text-sm font-semibold text-[var(--accent)] w-12 text-right">{pc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {([[Key, '创建 API Key'], [Banknote, '充值'], [BookOpen, '查看文档']] as const).map(([Icon, label]) => (
            <div key={label} className="flex-1 bg-[var(--accent-light)] rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-[var(--accent-light)]/80 transition-colors">
              <Icon className="w-6 h-6 text-[var(--accent)]" />
              <span className="text-sm font-semibold text-[var(--accent)]">{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
