import Link from "next/link";
import { BarChart3, DollarSign, Plug, Shield, TrendingUp, Zap } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { getPublicModels, getStatus, type Model } from "@/lib/api";

const features = [
  { icon: Zap, title: "智能路由", desc: "基于优先级、权重和健康状态自动调度上游通道" },
  { icon: Plug, title: "协议兼容", desc: "提供 OpenAI 兼容接口，便于现有应用平滑接入" },
  { icon: DollarSign, title: "按量计费", desc: "按模型实际 Token 消耗计费，账单和请求日志可追溯" },
  { icon: BarChart3, title: "用量透明", desc: "提供余额、调用趋势、模型排行和费用分析" },
  { icon: Shield, title: "安全控制", desc: "API Key 脱敏展示，支持限速、模型限制和 IP 白名单" },
  { icon: TrendingUp, title: "持续扩展", desc: "服务商、通道和模型配置可在后台统一管理" },
];

function formatContext(value?: number | null) {
  if (!value) return "-";
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatPrice(value?: number | null) {
  return value == null ? "-" : `¥${value}`;
}

function buildPricingRows(models: Model[]) {
  return models.slice(0, 4).map((model) => ({
    model: model.name,
    provider: model.vendor || "-",
    ctx: formatContext(model.context_window),
    input: formatPrice(model.input_price),
    output: formatPrice(model.output_price),
  }));
}

export default async function HomePage() {
  const [models, channels] = await Promise.all([
    getPublicModels().catch(() => []),
    getStatus().catch(() => []),
  ]);
  const providers = Array.from(new Set(models.map((model) => model.vendor || "unknown"))).slice(0, 8);
  const pricingRows = buildPricingRows(models);
  const healthyChannels = channels.filter((channel) => channel.healthy).length;
  const stats = [
    { value: models.length.toLocaleString("zh-CN"), label: "可用模型" },
    { value: providers.length.toLocaleString("zh-CN"), label: "模型供应商" },
    { value: channels.length.toLocaleString("zh-CN"), label: "接入渠道" },
    { value: healthyChannels.toLocaleString("zh-CN"), label: "健康渠道" },
  ];

  return (
    <PublicLayout>
      <section className="py-20 px-10 text-center relative overflow-hidden">
        <div className="max-w-[720px] mx-auto flex flex-col items-center gap-6 relative">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-light)]">
            <Zap className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--accent)]">AI API 网关</span>
          </div>
          <h1 className="text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">统一接入可用 AI 模型的 API 平台</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-[600px] leading-relaxed">通过 OpenAI 兼容接口接入后台已配置的模型、服务商和通道，统一管理密钥、余额、账单与用量。</p>
          <div className="flex items-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/90 transition-all active:scale-[0.98]">开始使用</Link>
            <Link href="/docs" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-[var(--foreground)] border border-[var(--line)] rounded-lg hover:bg-[var(--surface-soft)] transition-colors">查看文档</Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {providers.length === 0 ? <span className="text-sm text-[var(--text-muted)]">暂无公开供应商</span> : providers.map((provider) => <span key={provider} className="text-sm font-semibold text-[var(--text-muted)]">{provider}</span>)}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 bg-[var(--surface-soft)]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-[var(--foreground)]">核心能力</h2>
          <p className="text-base text-[var(--text-secondary)] text-center mb-12">能力来自当前项目已实现的后端模块</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return <div key={feature.title} className="bg-white border border-[var(--line)] rounded-lg p-6"><div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-[var(--accent)]" /></div><h3 className="text-base font-semibold mb-1.5 text-[var(--foreground)]">{feature.title}</h3><p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 text-center">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">实时公开数据</h2>
          <p className="text-base text-[var(--text-secondary)] mb-12">来自公开模型和服务状态接口</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => <div key={stat.label}><div className="text-4xl font-extrabold text-[var(--accent)] mb-1">{stat.value}</div><div className="text-sm text-[var(--text-secondary)]">{stat.label}</div></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 bg-[var(--surface-soft)]">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">公开模型价格</h2>
          <p className="text-base text-[var(--text-secondary)] mb-8">单位为元 / 百万 Token，以后台模型定价为准</p>
          <div className="bg-white border border-[var(--line)] rounded-lg overflow-hidden text-left">
            <div className="flex px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
              {["模型", "提供商", "上下文", "输入价格", "输出价格"].map((header) => <div key={header} className="flex-1">{header}</div>)}
            </div>
            {pricingRows.length === 0 ? <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">暂无公开定价数据</div> : pricingRows.map((row, index) => <div key={row.model} className={`flex px-4 py-3.5 text-sm ${index < pricingRows.length - 1 ? "border-b border-[var(--line)]" : ""}`}><div className="flex-1 font-medium text-[var(--foreground)] truncate pr-3">{row.model}</div><div className="flex-1 text-[var(--text-secondary)] truncate pr-3">{row.provider}</div><div className="flex-1 text-[var(--text-secondary)]">{row.ctx}</div><div className="flex-1 text-[var(--foreground)]">{row.input}</div><div className="flex-1 text-[var(--foreground)]">{row.output}</div></div>)}
          </div>
          <Link href="/pricing" className="inline-block mt-6 text-sm font-medium text-[var(--accent)] hover:underline">查看完整价格方案</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
