import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: '个人版',
    price: '免费',
    description: '适合个人开发者和小型项目',
    features: [
      '每月 10 万 Token 免费额度',
      '支持所有模型',
      '标准 API 接口',
      '基础请求日志',
    ],
    cta: '免费注册',
    variant: 'outline' as const,
    highlight: false,
  },
  {
    name: '专业版',
    price: '¥99/月',
    description: '适合团队和中型项目',
    features: [
      '每月 500 万 Token 额度',
      '优先级渠道路由',
      '高级请求分析',
      '多 API Key 管理',
      '专属技术支持',
    ],
    cta: '开始使用',
    variant: 'default' as const,
    highlight: true,
  },
  {
    name: '企业版',
    price: '定制',
    description: '适合大型企业和高流量场景',
    features: [
      '无限 Token 额度',
      '专属渠道部署',
      '企业管理与团队',
      'SLA 保障',
      '发票与合同支持',
      '专属客户经理',
    ],
    cta: '联系我们',
    variant: 'outline' as const,
    highlight: false,
  },
] as const;

/** 价格方案区域 — Stripe 风格卡片 */
export function PricingSection() {
  return (
    <section id="pricing" className="bg-[#030712] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            价格方案
          </h2>
          <p className="mt-4 text-lg text-white/40">
            按需选择，灵活计费
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 ${
                plan.highlight
                  ? 'border border-blue-500/40 bg-white/[0.04] shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                  : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]'
              }`}
            >
              {/* 推荐标签 */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-medium text-white shadow-lg shadow-blue-500/30">
                    推荐
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-white/90">{plan.name}</h3>
                <p className="mt-1 text-sm text-white/30">{plan.description}</p>
              </div>

              <div className="mt-7">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
              </div>

              <ul className="mt-7 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/50">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/register">
                  <Button variant={plan.variant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
