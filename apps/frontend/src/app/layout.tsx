import type { Metadata } from "next";
import { AuthProvider } from "@/providers/auth-provider";
import { PublicConfigProvider } from "@/providers/public-config-provider";
import { ToastProvider } from "@/components/ui/Toast";
import { buildApiUrl } from "@/lib/http";
import "./globals.css";

/** 服务端获取 SEO 配置 */
async function fetchSeoConfig() {
  const url = buildApiUrl("/api/v1/public-config");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchSeoConfig();
  const title = data?.seo_title || "ToAIAPI - 企业级 AI API 网关";
  const description =
    data?.seo_description ||
    "一站式 AI API 代理平台，支持 OpenAI、Anthropic、Google 等主流模型";

  return {
    title,
    description,
    keywords: data?.seo_keywords || "AI API,OpenAI,Claude,GPT,API代理",
    applicationName: data?.site_name || "ToAIAPI",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: "zh_CN",
      siteName: data?.site_name || "ToAIAPI",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-page text-neutral-900 font-sans antialiased selection:bg-neutral-900/10 selection:text-neutral-950">
        <PublicConfigProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </PublicConfigProvider>
      </body>
    </html>
  );
}
