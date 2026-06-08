"use client";

import Link from "next/link";
import { usePublicConfig } from "@/providers/public-config-provider";
import { sanitizeHtml } from "@/lib/sanitize-html";

const footerGroups = [
  {
    title: "产品",
    links: [
      { label: "首页", href: "/" },
      { label: "模型广场", href: "/models" },
      { label: "价格方案", href: "/pricing" },
      { label: "排行榜", href: "/leaderboard" },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "API 文档", href: "/docs" },
      { label: "服务状态", href: "/status" },
    ],
  },
];

export function Footer() {
  const { config } = usePublicConfig();
  const siteName = config.site_name || "ToAIAPI";

  return (
    <footer className="bg-[var(--surface-soft)] border-t border-[var(--line)]">
      <div className="max-w-[1440px] mx-auto px-10 py-12">
        <div className="flex gap-20 mb-8 justify-center">
          <div className="w-60">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl text-[var(--accent)]">◆</span>
              <span className="text-lg font-bold text-[var(--foreground)]">{siteName}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{config.site_subtitle || "AI API 网关"}</p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title} className="w-36">
              <div className="text-sm font-semibold text-[var(--foreground)] mb-3">{group.title}</div>
              <ul className="space-y-2">
                {group.links.map((link) => <li key={link.label}><Link href={link.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        {config.footer_content && <div className="mb-6 text-center text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.footer_content) }} />}
        <div className="h-px bg-[var(--line)] mb-6 max-w-[900px] mx-auto" />
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          {config.copyright && <span>{config.copyright}</span>}
          {config.icp_number_show && config.icp_number && <span>{config.icp_number}</span>}
          {config.psb_number_show && config.psb_number && <span>{config.psb_number}</span>}
        </div>
      </div>
    </footer>
  );
}
