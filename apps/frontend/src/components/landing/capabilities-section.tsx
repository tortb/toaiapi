import { Shield, Key, Wallet, LayoutDashboard } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Shield,
    title: '认证系统',
    description: 'JWT 认证、OAuth 集成、角色权限控制，安全可靠。',
  },
  {
    icon: Key,
    title: 'API Key 管理',
    description: '创建、启停、限流、模型白名单、IP 白名单，灵活配置。',
  },
  {
    icon: Wallet,
    title: '余额计费',
    description: '精确 Token 计量，按量扣费，充值记录，交易流水清晰。',
  },
  {
    icon: LayoutDashboard,
    title: '管理后台',
    description: 'Provider / 渠道 / 模型 / 用户管理，一站式运维。',
  },
] as const;

/** 平台能力区域 */
export function CapabilitiesSection() {
  return (
    <section className="border-y border-border bg-card/50 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            平台能力
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            完整的企业级 AI 平台基础设施
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cap.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
