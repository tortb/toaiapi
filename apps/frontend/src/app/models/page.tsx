"use client";

import * as React from "react";
import SiteShell from "@/components/SiteShell";
import { getPublicModels, type Model } from "@/lib/api";
import { ModelFilterBar } from "@/components/models/ModelFilterBar";
import { ModelCard } from "@/components/models/ModelCard";
import { ModelDetailDrawer } from "@/components/models/ModelDetailDrawer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModelsPage() {
  const [models, setModels] = React.useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = React.useState<Model[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);

  const loadModels = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPublicModels();
      setModels(data);
      setFilteredModels(data);
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadModels();
  }, [loadModels]);

  const providers = React.useMemo(() => {
    const p = models.map((m) => m.vendor).filter(Boolean) as string[];
    return Array.from(new Set(p));
  }, [models]);

  const handleFilterChange = (filters: { search: string; provider: string; type: string; tag: string; billingType: string }) => {
    let next = [...models];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      next = next.filter((m) =>
        m.name.toLowerCase().includes(s) || (m.description && m.description.toLowerCase().includes(s))
      );
    }
    if (filters.provider !== "all") {
      next = next.filter((m) => m.vendor === filters.provider);
    }
    if (filters.type !== "all") {
      next = next.filter((m) => m.type === filters.type);
    }
    if (filters.tag !== "all") {
      next = next.filter((m) => m.tags && m.tags.includes(filters.tag));
    }
    if (filters.billingType !== "all") {
      next = next.filter((m) => m.billing_type === filters.billingType);
    }
    setFilteredModels(next);
  };

  return (
    <SiteShell>
      <div className="relative overflow-hidden bg-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/20">
              <Sparkles className="h-3 w-3" />
              探索模型
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              模型广场
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-neutral-400 leading-relaxed">
              探索平台上所有可用的 AI 模型。从语言处理到图像生成，我们为您提供了最前沿的技术支持与极具竞争力的定价。
            </p>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <ModelFilterBar providers={providers} onFilterChange={handleFilterChange} />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition",
                view === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition",
                view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Sparkles className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-neutral-900">未找到匹配模型</h3>
            <p className="mt-2 text-neutral-500">尝试调整您的筛选条件或搜索词。</p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6",
              view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
          >
            {filteredModels.map((m) => (
              <ModelCard
                key={m.id || m.name}
                model={m}
                onClick={() => setSelectedModel(m.name)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900">未找到您需要的模型？</h2>
          <p className="mt-4 text-lg text-neutral-500 leading-relaxed">
            我们正在不断增加对新模型和供应商的支持。如果您有特定的需求，或者希望我们接入某个特定模型，请随时联系我们。
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-12 px-8 font-bold">
              联系技术支持
            </Button>
            <Button variant="secondary" size="lg" className="h-12 px-8 font-bold">
              查看开发文档
            </Button>
          </div>
        </div>
      </section>

      <ModelDetailDrawer
        modelName={selectedModel}
        open={selectedModel !== null}
        onClose={() => setSelectedModel(null)}
      />
    </SiteShell>
  );
}
