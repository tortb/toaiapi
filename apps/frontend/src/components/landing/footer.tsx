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
      { href: '/models', label: '模型列表' },
      { href: '/status', label: '服务状态' },
    ],
  },
  {
    title: '账户',
    links: [
      { href: '/login', label: '登录' },
      { href: '/register', label: '注册' },
      { href: '/', label: '控制台' },
    ],
  },
] as const;

/** 页脚 */
export function Footer() {
  return (
    <footer className="bg-[#030712]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Logo 列 */}
          <div>
            <span className="text-lg font-bold text-white tracking-tight">ToAIAPI</span>
            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              企业级 AI Gateway 平台
            </p>
          </div>

          {/* 链接列 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-medium text-white/60">{section.title}</h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
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
        <div className="mt-14 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} ToAIAPI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
