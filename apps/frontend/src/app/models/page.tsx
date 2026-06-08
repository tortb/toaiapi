import { PublicLayout } from "@/components/layout/public-layout";
import { getPublicModels } from "@/lib/api";
import { Search } from "lucide-react";

function formatContext(value?: number | null) {
  if (!value) return "-";
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatPrice(value?: number | null) {
  return value == null ? "-" : `¥${value}`;
}

export default async function ModelsPage() {
  const models = await getPublicModels().catch(() => []);
  const providers = Array.from(new Set(models.map((model) => model.vendor || "unknown"))).slice(0, 6);

  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">模型广场</h1><p className="mt-2 text-base text-[var(--text-secondary)]">浏览所有可用 AI 模型，选择最适合您需求的模型</p></div>
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[var(--line)] rounded-md w-full sm:w-[280px]">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-muted)]">当前共 {models.length} 个模型</span>
          </div>
          {["全部", ...providers].map((filter, index) => (
            <span key={filter} className={`px-4 py-1.5 text-sm rounded-full border ${index === 0 ? "bg-[var(--accent)] text-white border-transparent" : "border-[var(--line)] text-[var(--text-secondary)]"}`}>{filter}</span>
          ))}
        </div>
        {models.length === 0 ? (
          <div className="bg-white border border-[var(--line)] rounded-xl p-10 text-center text-[var(--text-secondary)]">暂无可用模型</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {models.map((model) => (
              <div key={model.id} className="bg-white border border-[var(--line)] rounded-lg p-6 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                  <h3 className="text-base font-semibold text-[var(--foreground)] truncate">{model.name}</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{model.vendor} · {formatContext(model.context_window)} context</p>
                <div className="flex flex-wrap gap-2 mb-3 min-h-6">
                  {(model.tags || []).slice(0, 4).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-[var(--surface-soft)] text-[var(--text-secondary)] rounded">{tag}</span>
                  ))}
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">输入 {formatPrice(model.input_price)} / 输出 {formatPrice(model.output_price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
