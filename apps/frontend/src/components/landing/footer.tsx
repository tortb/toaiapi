import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    title: '产品',
    links: [
      { href: '/#features', label: '产品优势' },
      { href: '/models', label: '支持模型' },
      { href: '/#pricing', label: '价格方案' },
      { href: '/status', label: '服务状态' },
    ],
  },
  {
    title: '开发者',
    links: [
      { href: '/#docs', label: 'API 文档' },
      { href: '/#examples', label: '接入示例' },
      { href: '/#sdks', label: 'SDK' },
    ],
  },
  {
    title: '账户',
    links: [
      { href: '/login', label: '登录' },
      { href: '/register', label: '注册' },
      { href: '/dashboard', label: '控制台' },
    ],
  },
] as const;

/** 页脚 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo 列 */}
          <div>
            <span className="text-lg font-bold text-foreground">ToAIAPI</span>
            <p className="mt-3 text-sm text-muted-foreground">
              企业级 AI Gateway 平台
            </p>
          </div>

          {/* 链接列 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-medium text-foreground">{section.title}</h4>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ToAIAPI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
