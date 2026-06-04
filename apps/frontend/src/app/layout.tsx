import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ToAIAPI - 企业级 AI Gateway 平台',
  description: '统一接入 OpenAI、Anthropic、Gemini、DeepSeek 等全球领先 AI 模型。一次接入，多模型调用，统一计费、统一鉴权、统一管理。',
  openGraph: {
    title: 'ToAIAPI - 企业级 AI Gateway 平台',
    description: '统一接入全球领先 AI 模型，一次接入，多模型调用。',
    url: 'https://toaiapi.com',
    siteName: 'ToAIAPI',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToAIAPI - 企业级 AI Gateway 平台',
    description: '统一接入全球领先 AI 模型，一次接入，多模型调用。',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
