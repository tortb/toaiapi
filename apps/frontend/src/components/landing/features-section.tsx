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

/** 产品优势区域 */
export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            产品优势
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            为开发者和企业团队打造的 AI 基础设施
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
