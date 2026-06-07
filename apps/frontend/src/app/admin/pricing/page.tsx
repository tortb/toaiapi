"use client";

import * as React from "react";
import {
  getModels,
  getProviders,
  type ModelData,
  type ProviderData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPagination, AdminToolbar, StatusBadge } from "@/components/admin/data";
import { ModelPricingModal, OptionalPriceText } from "@/components/admin/models/ModelPricingModal";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Skeleton,
  Table,
  type TableColumn,
} from "@/components/ui";

function ModelStatus({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? "success" : "neutral"}>{active ? "上架中" : "已下架"}</StatusBadge>;
}

export default function PricingPage() {
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [pricingModel, setPricingModel] = React.useState<ModelData | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    let mounted = true;
    getProviders({ pageSize: 100 })
      .then((res) => {
        if (mounted) setProviders(res.items);
      })
      .catch(() => {
        if (mounted) setProviders([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const fetchModels = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getModels({ page, pageSize: 50, search: search || undefined });
      setModels(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const providerMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of providers) map.set(provider.id, provider.displayName);
    return map;
  }, [providers]);

  const columns = React.useMemo<TableColumn<ModelData>[]>(
    () => [
      {
        key: "model",
        title: "模型",
        className: "min-w-[220px]",
        render: (model) => (
          <div>
            <div className="font-medium text-neutral-950">{model.displayName}</div>
            <div className="mt-0.5 font-mono text-xs text-neutral-400">{model.name}</div>
          </div>
        ),
      },
      {
        key: "provider",
        title: "服务商",
        render: (model) => <span className="text-neutral-600">{providerMap.get(model.providerId) ?? model.providerId}</span>,
      },
      {
        key: "inputPrice",
        title: "输入价",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (model) => <OptionalPriceText value={model.pricing?.inputPrice} />,
      },
      {
        key: "outputPrice",
        title: "输出价",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (model) => <OptionalPriceText value={model.pricing?.outputPrice} />,
      },
      {
        key: "cachedPrice",
        title: "缓存价",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (model) => <OptionalPriceText value={model.pricing?.cachedPrice} muted />,
      },
      {
        key: "reasoningPrice",
        title: "推理价",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (model) => <OptionalPriceText value={model.pricing?.reasoningPrice} muted />,
      },
      {
        key: "multiplier",
        title: "倍率",
        headerClassName: "text-right",
        className: "text-right font-mono text-neutral-600",
        render: (model) => (model.pricing ? model.pricing.multiplier + "x" : <span className="text-neutral-300">-</span>),
      },
      {
        key: "status",
        title: "状态",
        render: (model) => <ModelStatus active={model.isActive} />,
      },
      {
        key: "actions",
        title: "操作",
        headerClassName: "text-right",
        className: "text-right",
        render: (model) => (
          <Button type="button" variant="secondary" size="sm" onClick={() => setPricingModel(model)}>
            编辑定价
          </Button>
        ),
      },
    ],
    [providerMap],
  );

  return (
    <AdminShell title="模型价格">
      <AdminToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索模型"
        actions={<span className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">元/百万 Token</span>}
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3">
          <span className="text-sm text-error">{error}</span>
          <Button type="button" variant="secondary" size="sm" onClick={fetchModels}>
            重试
          </Button>
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading && models.length === 0 ? (
            <Skeleton variant="table" lines={7} className="rounded-xl border-0" />
          ) : (
            <Table
              columns={columns}
              data={models}
              rowKey="id"
              loading={isLoading}
              empty={<EmptyState title="暂无模型定价" description="模型创建后可在这里维护输入、输出与缓存价格。" />}
              className="border-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ModelPricingModal
        open={Boolean(pricingModel)}
        model={pricingModel}
        onClose={() => setPricingModel(null)}
        onSaved={() => {
          setPricingModel(null);
          fetchModels();
        }}
      />
    </AdminShell>
  );
}
