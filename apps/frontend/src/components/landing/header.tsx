'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/#features', label: '产品' },
  { href: '/models', label: '模型' },
  { href: '/#pricing', label: '价格' },
  { href: '/status', label: '状态' },
] as const;

/** 玻璃拟态固定导航栏 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-tight">ToAIAPI</span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右侧按钮 */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm">登录</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">注册</Button>
          </Link>
        </div>

        {/* 移动端菜单按钮 */}
        <button
          className="text-white/60 hover:text-white transition-colors md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 移动端菜单 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-white/[0.06] bg-black/60 backdrop-blur-xl px-4 py-4">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-white/50 hover:text-white transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">登录</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full" size="sm">注册</Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
