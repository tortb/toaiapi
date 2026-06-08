'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: '首页', href: '/' },
  { label: '模型', href: '/models' },
  { label: '价格', href: '/pricing' },
  { label: '排行榜', href: '/leaderboard' },
  { label: '文档', href: '/docs' },
  { label: '服务状态', href: '/status' },
]

export function PublicNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-[var(--line)] bg-white">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-10 h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-[var(--accent)]">◆</span>
          <span className="text-lg font-bold text-[var(--foreground)]">ToAIAPI</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-md hover:bg-[var(--accent)]/90 transition-colors"
          >
            注册
          </Link>
        </div>
      </div>
    </header>
  )
}
