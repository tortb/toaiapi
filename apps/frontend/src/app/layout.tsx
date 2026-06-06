import type { Metadata } from "next";
import { AuthProvider } from "@/providers/auth-provider";
import { PublicConfigProvider } from "@/providers/public-config-provider";
import { buildApiUrl } from "@/lib/http";
import "./globals.css";

/** 服务端获取 SEO 配置 */
async function fetchSeoConfig() {
  const url = buildApiUrl("/api/v1/public-config");
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchSeoConfig();
  return {
    title: data?.seo_title || "ToAIAPI - 企业级 AI API 网关",
    description:
      data?.seo_description ||
      "一站式 AI API 代理平台，支持 OpenAI、Anthropic、Google 等主流模型",
    keywords: data?.seo_keywords || "AI API,OpenAI,Claude,GPT,API代理",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <PublicConfigProvider>
          <AuthProvider>{children}</AuthProvider>
        </PublicConfigProvider>
      </body>
    </html>
  );
}
