import {
  Plug,
  Layers,
  CreditCard,
  Settings,
  Shuffle,
  BarChart3,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Plug,
    title: '统一 API',
    description: 'OpenAI 兼容格式，一次接入即可调用所有模型。',
  },
  {
    icon: Layers,
    title: '多模型聚合',
    description: '支持 OpenAI、Anthropic、Gemini、DeepSeek 等主流模型。',
  },
  {
    icon: CreditCard,
    title: '企业级计费',
    description: '精确 Token 计量，按量计费，支持套餐与余额管理。',
  },
  {
    icon: Settings,
    title: '渠道管理',
    description: '多渠道配置，权重与优先级控制，API Key 集中管理。',
  },
  {
    icon: Shuffle,
    title: '高可用路由',
    description: '自动故障转移，智能负载均衡，保障服务连续性。',
  },
  {
    icon: BarChart3,
    title: '实时监控',
    description: '请求日志、延迟统计、失败率追踪，一目了然。',
  },
] as const;

/** 产品优势区域 — 微光卡片 */
export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-[#030712] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            产品优势
          </h2>
          <p className="mt-4 text-lg text-white/40">
            为开发者和企业团队打造的 AI 基础设施
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white/90">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/40">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
