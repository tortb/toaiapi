import type { Metadata } from 'next';
import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { ModelsSection } from '@/components/landing/models-section';
import { CodeSection } from '@/components/landing/code-section';
import { CapabilitiesSection } from '@/components/landing/capabilities-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FaqSection } from '@/components/landing/faq-section';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'ToAIAPI - 企业级 AI Gateway 平台',
  description:
    '统一接入 OpenAI、Anthropic、Gemini、DeepSeek 等全球领先 AI 模型。一次接入，多模型调用，统一计费、统一鉴权、统一管理。',
  openGraph: {
    title: 'ToAIAPI - 企业级 AI Gateway 平台',
    description: '统一接入全球领先 AI 模型，一次接入，多模型调用。',
    url: 'https://toaiapi.com',
    siteName: 'ToAIAPI',
    locale: 'zh_CN',
    type: 'website',
  },
};

/** Landing Page - 产品官网首页 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ModelsSection />
        <CodeSection />
        <CapabilitiesSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
