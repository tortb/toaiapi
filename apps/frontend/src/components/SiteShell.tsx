"use client";

import React from "react";
import Link from "next/link";
import { usePublicConfig } from "@/providers/public-config-provider";
import {
  ToAiAPILogo,
  IconChevronDown,
  IconArrowRight,
  IconLogoSmall,
  QRCode,
} from "@/components/PixelIcons";

export function Header() {
  const { config } = usePublicConfig();
  const siteName = config.site_name || "ToAiAPI";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            {config.logo_url ? (
              <img src={config.logo_url} alt={siteName} className="h-8 w-auto" />
            ) : (
              <ToAiAPILogo size={32} />
            )}
            <span className="text-[20px] font-bold text-gray-900">
              {siteName}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[14px] text-gray-600">
            <Link href="/" className="hover:text-primary flex items-center gap-1">
              产品 <IconChevronDown size={12} />
            </Link>
            <Link href="/models" className="hover:text-primary">模型</Link>
            <Link href="/pricing" className="hover:text-primary">价格</Link>
            <Link href="/docs" className="hover:text-primary">文档</Link>
            <Link href="/status" className="hover:text-primary">服务状态</Link>
            <a href="#" className="hover:text-primary">支持</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[14px] text-gray-700 px-3 py-1.5 hover:text-primary">
            登录
          </Link>
          {config.allow_register !== false && (
            <Link href="/register" className="text-[14px] text-white bg-primary px-4 py-1.5 rounded hover:bg-primary-600 transition">
              注册
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { config } = usePublicConfig();
  const siteName = config.site_name || "ToAiAPI";
  const copyright = config.copyright || `© 2026 ${siteName}. All rights reserved.`;
  const showIcp = config.icp_number_show && config.icp_number;
  const showPsb = config.psb_number_show && config.psb_number;

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              {config.logo_url ? (
                <img src={config.logo_url} alt={siteName} className="h-7 w-auto" />
              ) : (
                <ToAiAPILogo size={28} />
              )}
              <span className="text-[18px] font-bold text-gray-900">
                {siteName}
              </span>
            </div>
            <p className="text-[12.5px] text-gray-500 leading-[1.7] max-w-[260px]">
              {config.site_subtitle || "全球领先的 AI API 中转平台，为开发者提供稳定、安全、强大的 AI API 服务。"}
            </p>
            {config.contact_email && (
              <p className="text-[12px] text-gray-400 mt-2">
                联系我们：<a href={`mailto:${config.contact_email}`} className="hover:text-primary">{config.contact_email}</a>
              </p>
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-3">产品</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/models" className="text-[12.5px] text-gray-500 hover:text-primary">模型</Link>
              </li>
              <li>
                <Link href="/docs" className="text-[12.5px] text-gray-500 hover:text-primary">API 文档</Link>
              </li>
              <li>
                <Link href="/" className="text-[12.5px] text-gray-500 hover:text-primary">控制台</Link>
              </li>
              <li>
                <Link href="/status" className="text-[12.5px] text-gray-500 hover:text-primary">API 状态</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-3">文档</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-[12.5px] text-gray-500 hover:text-primary">快速开始</Link>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">API 参考</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">SDK 下载</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">更新日志</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-3">支持</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">技术支持</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">服务条款</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">隐私政策</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">联系我们</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-3">关于我们</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">公司简介</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">加入我们</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">博客</a>
              </li>
              <li>
                <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">合作伙伴</a>
              </li>
            </ul>
          </div>
        </div>

        {/* 页脚自定义内容 */}
        {config.footer_content && (
          <div
            className="border-t border-gray-200 pt-4 mb-4 text-[12.5px] text-gray-500 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: config.footer_content }}
          />
        )}

        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[12.5px] text-gray-500">{copyright}</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              {showIcp && (
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {config.icp_number}
                </a>
              )}
              {showPsb && (
                <a
                  href="https://www.beian.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <img
                    src="https://www.beian.gov.cn/img/ghs.png"
                    alt="公安备案"
                    className="w-3.5 h-3.5"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  {config.psb_number}
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <QRCode size={60} />
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1AAD19] flex items-center justify-center text-white text-[10px] font-bold">W</div>
              <div className="w-7 h-7 rounded-full bg-[#1A1D21] flex items-center justify-center text-white text-[10px] font-bold">G</div>
              <div className="w-7 h-7 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white text-[10px] font-bold">T</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
