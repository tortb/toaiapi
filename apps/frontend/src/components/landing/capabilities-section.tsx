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
    <section className="bg-[#030712] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            平台能力
          </h2>
          <p className="mt-4 text-lg text-white/40">
            完整的企业级 AI 平台基础设施
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 text-center backdrop-blur-xl transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.04]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white/90">{cap.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/40">
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
