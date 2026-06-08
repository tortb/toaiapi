import { PublicLayout } from "@/components/layout/public-layout";
import { getPublicModels } from "@/lib/api";

function formatContext(value?: number | null) {
  if (!value) return "-";
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatPrice(value?: number | null) {
  return value == null ? "-" : `¥${value}`;
}

export default async function PricingPage() {
  const models = await getPublicModels().catch(() => []);
  const providers = Array.from(new Set(models.map((model) => model.vendor || "unknown"))).slice(0, 6);

  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">价格方案</h1><p className="mt-2 text-base text-[var(--text-secondary)]">模型定价单位为「元 / 百万 Token」，按实际用量计费</p></div>
        <div className="flex flex-wrap gap-1 mb-4">
          {["全部模型", ...providers].map((item, index) => (
            <span key={item} className={`px-4 py-2 text-sm rounded-md ${index === 0 ? "bg-[var(--accent)] text-white font-medium" : "text-[var(--text-secondary)] bg-[var(--surface-soft)]"}`}>{item}</span>
          ))}
        </div>
        <div className="bg-white border border-[var(--line)] rounded-lg overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 px-4 py-3.5 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
              {["模型", "提供商", "上下文", "输入价格", "输出价格", "缓存价格", "推理价格"].map((header) => <div key={header}>{header}</div>)}
            </div>
            {models.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">暂无定价数据</div>
            ) : models.map((model, index) => (
              <div key={model.id} className={`grid grid-cols-7 px-4 py-3.5 text-sm ${index < models.length - 1 ? "border-b border-[var(--line)]" : ""}`}>
                <div className="font-medium text-[var(--foreground)] truncate pr-3">{model.name}</div>
                <div className="text-[var(--text-secondary)] truncate pr-3">{model.vendor}</div>
                <div className="text-[var(--text-secondary)]">{formatContext(model.context_window)}</div>
                <div className="text-[var(--foreground)]">{formatPrice(model.input_price)}</div>
                <div className="text-[var(--foreground)]">{formatPrice(model.output_price)}</div>
                <div className="text-[var(--foreground)]">{formatPrice(model.cache_price)}</div>
                <div className="text-[var(--foreground)]">{formatPrice(model.reasoning_price)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-12"><h2 className="text-2xl font-semibold text-[var(--foreground)]">准备好开始了吗？</h2><p className="text-sm text-[var(--text-secondary)] mt-2 mb-6">注册后创建 API Key，即可按量调用模型</p>
          <a href="/register" className="inline-flex px-8 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--accent)]/90 transition-colors">免费注册 →</a>
        </div>
      </div>
    </PublicLayout>
  );
}
