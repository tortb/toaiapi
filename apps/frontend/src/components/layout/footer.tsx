import Link from 'next/link'

const footerGroups = [
  {
    title: '产品',
    links: [
      { label: '首页', href: '/' },
      { label: '模型广场', href: '/models' },
      { label: '价格方案', href: '/pricing' },
      { label: '排行榜', href: '/leaderboard' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: 'API 文档', href: '/docs' },
      { label: '服务状态', href: '/status' },
    ],
  },
  {
    title: '公司',
    links: [
      { label: '关于我们', href: '#' },
      { label: '隐私政策', href: '#' },
      { label: '服务条款', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[var(--surface-soft)] border-t border-[var(--line)]">
      <div className="max-w-[1440px] mx-auto px-10 py-12">
        <div className="flex gap-20 mb-8 justify-center">
          <div className="w-60">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl text-[var(--accent)]">◆</span>
              <span className="text-lg font-bold text-[var(--foreground)]">ToAIAPI</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              更智能、更快速、更可靠的 AI API 网关
            </p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title} className="w-36">
              <div className="text-sm font-semibold text-[var(--foreground)] mb-3">{group.title}</div>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="h-px bg-[var(--line)] mb-6 max-w-[900px] mx-auto" />
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          <span>© 2026 ToAIAPI. All rights reserved.</span>
          <span>沪ICP备XXXXXXXX号</span>
          <span>沪公网安备 XXXXXXXXXXXX号</span>
        </div>
      </div>
    </footer>
  )
}
