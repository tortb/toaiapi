import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ToAIAPI - 企业级 AI API 网关",
  description: "一站式 AI API 代理平台，支持 OpenAI、Anthropic、Google 等主流模型",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-[var(--foreground)] antialiased">{children}</body>
    </html>
  )
}
