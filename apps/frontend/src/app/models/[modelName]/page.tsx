import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getModelDetail } from "@/lib/api";

function formatContext(value?: number | null) {
  if (!value) return "-";
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatPrice(value?: number | null) {
  return value == null ? "-" : `¥${value}`;
}

export default async function ModelDetailPage({ params }: { params: Promise<{ modelName: string }> }) {
  const { modelName } = await params;
  const model = await getModelDetail(modelName).catch(() => null);
  if (!model) notFound();

  return (
    <PublicLayout>
      <main className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Link href="/models" className="text-sm text-[var(--accent)] hover:underline">返回模型广场</Link>
            <h1 className="mt-3 text-4xl font-bold text-[var(--foreground)]">{model.name}</h1>
            <p className="mt-2 text-base text-[var(--text-secondary)]">{model.vendor} · {model.type} · {model.billing_type}</p>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-right">
            <div className="text-xs text-[var(--text-muted)]">上下文窗口</div>
            <div className="mt-1 text-xl font-semibold text-[var(--foreground)]">{formatContext(model.context_window)}</div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label="输入价格" value={formatPrice(model.input_price)} />
          <Stat label="输出价格" value={formatPrice(model.output_price)} />
          <Stat label="缓存价格" value={formatPrice(model.cache_price)} />
          <Stat label="推理价格" value={formatPrice(model.reasoning_price)} />
        </section>

        <section className="bg-white border border-[var(--line)] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">能力标签</h2>
          {(model.tags ?? []).length === 0 ? <p className="text-sm text-[var(--text-secondary)]">暂无标签</p> : <div className="flex flex-wrap gap-2">{model.tags!.map((tag) => <span key={tag} className="rounded bg-[var(--surface-soft)] px-2 py-1 text-xs text-[var(--text-secondary)]">{tag}</span>)}</div>}
        </section>

        <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)] grid grid-cols-3"><div>方法</div><div>路径</div><div>说明</div></div>
          {(model.apiEndpoints ?? []).map((endpoint) => <div key={endpoint.path} className="grid grid-cols-3 px-4 py-3 text-sm border-t border-[var(--line)]"><div className="font-mono text-xs">{endpoint.method}</div><div className="font-mono text-xs">{endpoint.path}</div><div>{endpoint.label}</div></div>)}
        </section>
      </main>
    </PublicLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--line)] bg-white p-4"><div className="text-xs text-[var(--text-muted)]">{label}</div><div className="mt-2 text-xl font-semibold text-[var(--foreground)]">{value}</div></div>;
}
