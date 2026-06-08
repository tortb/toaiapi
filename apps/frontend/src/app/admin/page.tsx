'use client'

import Link from 'next/link'
import { LayoutDashboard, Users, User, UsersRound, Key, Shield, Bot, Cable, Building2, DollarSign, ClipboardList, Banknote, FileText, PartyPopper, Receipt, Settings, MessageSquare, CheckSquare, LogOut, TrendingUp } from 'lucide-react'

const groups: [string, [typeof LayoutDashboard, string, string][]][] = [
  ['概览', [[LayoutDashboard, '控制台', '/admin']]],
  ['账户', [[Users, '用户管理', '/admin/users'], [User, '用户详情', '/admin/users/1'], [UsersRound, '用户分组', '/admin/users/groups'], [Key, 'API Key', '/admin/apikeys'], [Shield, '角色权限', '/admin/roles']]],
  ['模型', [[Bot, '模型管理', '/admin/models'], [Cable, '通道管理', '/admin/channels'], [Building2, '服务商', '/admin/providers'], [DollarSign, '价格策略', '/admin/pricing']]],
  ['财务', [[ClipboardList, '订单', '/admin/orders'], [Banknote, '充值记录', '/admin/recharges'], [FileText, '账单', '/admin/bills'], [PartyPopper, '充值活动', '/admin/promotions'], [Receipt, '发票', '/admin/invoices'], [Settings, '支付配置', '/admin/payment-configs'], [Settings, '兑换码', '/admin/redeem']]],
  ['系统', [[Settings, '系统设置', '/admin/settings'], [MessageSquare, '短信', '/admin/sms'], [CheckSquare, '签到配置', '/admin/checkin']]],
]

const stats: [string, string, string][] = [['注册用户', '2,847', '+12.5%'], ['总充值', '¥128.5K', '+8.3%'], ['总消费', '¥96.2K', '+15.2%'], ['总调用', '1.2M', '+22.1%'], ['总余额', '¥284.5K', '-']]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-[260px] min-h-screen bg-[var(--surface-soft)] border-r border-[var(--line)] flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--line)]"><span className="text-xl text-[var(--accent)]">◆</span><span className="text-base font-bold text-[var(--foreground)]">ToAIAPI Admin</span></div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {groups.map(([title, items]) => (
            <div key={title}>
              <div className="px-3 mb-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</div>
              {items.map(([Icon, label, href]) => (
                <Link key={label} href={href} className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-sm mb-0.5 transition-colors ${href === '/admin' ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'}`}>
                  <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-3 pb-4 border-t border-[var(--line)] pt-3">
          <button className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors w-full text-left">
            <LogOut className="w-4 h-4" /><span>退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#FAFAFA] p-8">
        <div className="flex items-center gap-4 mb-6"><h1 className="text-2xl font-bold text-[var(--foreground)]">控制台</h1><span className="text-sm text-[var(--text-muted)] flex-1">系统概览与关键指标</span></div>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {stats.map(([l, v, c]) => (
            <div key={l} className="bg-white border border-[var(--line)] rounded-lg p-4">
              <div className="text-xs text-[var(--text-secondary)] mb-1">{l}</div>
              <div className="text-xl font-bold text-[var(--foreground)] mb-1">{v}</div>
              <div className={`text-xs font-medium ${c.startsWith('+') ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>{c}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-6">
          <div className="flex-1 bg-white border border-[var(--line)] rounded-lg p-6">
            <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">调用趋势</h3>
            <div className="h-[200px] bg-[var(--surface-soft)] rounded-lg flex items-center justify-center"><TrendingUp className="w-8 h-8 text-[var(--text-muted)]" /></div>
          </div>
          <div className="w-[380px] bg-white border border-[var(--line)] rounded-lg p-6">
            <h3 className="text-base font-semibold mb-4 text-[var(--foreground)]">最近订单</h3>
            {[['ORD-001', 'l**@e.com', '¥200', '已完成'], ['ORD-002', 'w**@e.com', '¥100', '已完成'], ['ORD-003', 'z**@e.com', '¥50', '待支付']].map(([no, usr, amt, st]) => (
              <div key={no} className="flex items-center gap-2 py-2 border-b border-[var(--line)] last:border-b-0">
                <span className="text-xs font-mono text-[var(--foreground)] flex-1">{no}</span>
                <span className="text-xs text-[var(--text-secondary)] w-20">{usr}</span>
                <span className="text-xs font-medium text-[var(--foreground)] w-16">{amt}</span>
                <span className={`text-xs font-medium w-16 text-right ${st === '已完成' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>{st}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
