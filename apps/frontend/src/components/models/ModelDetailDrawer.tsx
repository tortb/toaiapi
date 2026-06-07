"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Zap, Copy, Check } from "lucide-react";
import { getModelDetail, type ModelDetail, type ModelGroupPricing, type ModelApiEndpoint } from "@/lib/api";

interface ModelDetailDrawerProps {
  modelName: string | null;
  open: boolean;
  onClose: () => void;
}

function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) return "-";
  return `¥${(price / 100).toFixed(4)}/M`;
}

function GroupPricingTable({ pricing }: { pricing: ModelGroupPricing[] }) {
  if (!pricing || pricing.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-neutral-900">分组价格</h4>
      <p className="text-xs text-neutral-500">不同用户分组的价格信息</p>
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-3 py-2 text-left font-medium text-neutral-500">分组</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-500">计费类型</th>
              <th className="px-3 py-2 text-right font-medium text-neutral-500">价格摘要</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p, i) => (
              <tr key={i} className="border-b border-neutral-50 last:border-0">
                <td className="px-3 py-2 font-medium text-neutral-900">{p.group}</td>
                <td className="px-3 py-2 text-neutral-600">{p.billingType === "request" ? "按次" : "按量"}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-neutral-600">
                      输入 <Zap className="inline h-2.5 w-2.5 text-amber-500" /> {formatPrice(p.inputPrice)}
                    </span>
                    <span className="text-neutral-600">
                      补全 <Zap className="inline h-2.5 w-2.5 text-blue-500" /> {formatPrice(p.outputPrice)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiEndpointInfo({ endpoints }: { endpoints: ModelApiEndpoint[] }) {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!endpoints || endpoints.length === 0) return null;

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-neutral-900">API 端点</h4>
      <div className="space-y-2">
        {endpoints.map((ep, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                {ep.method}
              </Badge>
              <div>
                <p className="text-xs font-medium text-neutral-900">{ep.label}</p>
                <p className="font-mono text-[10px] text-neutral-500">{ep.path}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(ep.path)}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition"
            >
              {copied === ep.path ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModelDetailDrawer({
  modelName,
  open,
  onClose,
}: ModelDetailDrawerProps) {
  const [detail, setDetail] = React.useState<ModelDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!modelName || !open) {
      setDetail(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    getModelDetail(modelName)
      .then(setDetail)
      .catch((err) => setError(err.message || "加载失败"))
      .finally(() => setIsLoading(false));
  }, [modelName, open]);

  const tags = detail?.tags || ["对话"];

  return (
    <Drawer open={open} onClose={onClose} title="模型详情" size="lg">
      {isLoading ? (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : detail ? (
        <div className="space-y-6 p-6">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              {detail.name}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="neutral" size="sm">
                {detail.type === "image"
                  ? "图像"
                  : detail.type === "audio"
                  ? "音频"
                  : detail.type === "video"
                  ? "视频"
                  : "文本"}
              </Badge>
              <span className="text-sm text-neutral-500">
                {detail.vendor || "Public"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-neutral-900">基本信息</h4>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {detail.description || "暂无描述"}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="neutral" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl bg-neutral-50 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-neutral-900">价格</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-neutral-400">输入价格</p>
                <p className="text-sm font-bold text-neutral-900">
                  {formatPrice(detail.input_price)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400">补全价格</p>
                <p className="text-sm font-bold text-neutral-900">
                  {formatPrice(detail.output_price)}
                </p>
              </div>
              {detail.cache_price !== undefined && detail.cache_price !== null && (
                <div>
                  <p className="text-[10px] text-neutral-400">缓存命中</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {formatPrice(detail.cache_price)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* API Endpoints */}
          <ApiEndpointInfo endpoints={detail.apiEndpoints || []} />

          {/* Group Pricing */}
          <GroupPricingTable pricing={detail.groupPricing || []} />
        </div>
      ) : null}
    </Drawer>
  );
}
