import * as React from "react";
import SiteShell from "@/components/SiteShell";
import { getModelDetail, type ModelDetail } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Zap, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ modelName: string }>;
}

function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) return "-";
  return `¥${(price / 100).toFixed(4)}/M`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { modelName } = await params;
  const decoded = decodeURIComponent(modelName);
  return {
    title: `${decoded} — 模型详情`,
    description: `查看 ${decoded} 模型的详细信息、价格和 API 端点。`,
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { modelName } = await params;
  const decoded = decodeURIComponent(modelName);

  let detail: ModelDetail | null = null;
  let error: string | null = null;

  try {
    detail = await getModelDetail(decoded);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "加载失败";
  }

  const tags = detail?.tags || ["对话"];

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Link */}
        <Link
          href="/models"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回模型广场
        </Link>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-xl font-bold text-neutral-900">
              模型未找到
            </h2>
            <p className="mt-2 text-neutral-500">{error}</p>
            <Link
              href="/models"
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 shadow-btn transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              返回模型广场
            </Link>
          </div>
        ) : detail ? (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
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
              <h1 className="text-3xl font-bold text-neutral-900">
                {detail.name}
              </h1>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                {detail.description || "暂无描述"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="neutral" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                价格信息
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-600 font-medium">输入价格</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-xl font-bold text-neutral-900">
                      {formatPrice(detail.input_price)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs text-blue-600 font-medium">补全价格</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-xl font-bold text-neutral-900">
                      {formatPrice(detail.output_price)}
                    </span>
                  </div>
                </div>
                {detail.cache_price !== undefined && detail.cache_price !== null && (
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-600 font-medium">
                      缓存命中
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <Zap className="h-4 w-4 text-emerald-500" />
                      <span className="text-xl font-bold text-neutral-900">
                        {formatPrice(detail.cache_price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* API Endpoints */}
            {detail.apiEndpoints && detail.apiEndpoints.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  API 端点
                </h2>
                <div className="space-y-3">
                  {detail.apiEndpoints.map((ep, i) => (
                    <EndpointRow key={i} method={ep.method} path={ep.path} label={ep.label} />
                  ))}
                </div>
              </div>
            )}

            {/* Group Pricing */}
            {detail.groupPricing && detail.groupPricing.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  分组价格
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  不同用户分组的价格信息
                </p>
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50">
                        <th className="px-4 py-3 text-left font-medium text-neutral-500">
                          分组
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-neutral-500">
                          计费类型
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-neutral-500">
                          价格摘要
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.groupPricing.map((p, i) => (
                        <tr
                          key={i}
                          className="border-b border-neutral-50 last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {p.group}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {p.billingType === "request" ? "按次" : "按量"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-neutral-600">
                              输入{" "}
                              <Zap className="inline h-3 w-3 text-amber-500" />{" "}
                              {formatPrice(p.inputPrice)}
                            </span>
                            <span className="mx-3 text-neutral-300">|</span>
                            <span className="text-neutral-600">
                              补全{" "}
                              <Zap className="inline h-3 w-3 text-blue-500" />{" "}
                              {formatPrice(p.outputPrice)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/dashboard/apikeys"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-neutral-950 px-8 text-md font-bold text-white shadow-btn transition hover:bg-neutral-800"
              >
                创建 API 密钥
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-neutral-200 bg-white px-8 text-md font-bold text-neutral-900 shadow-btn transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                查看开发文档
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </SiteShell>
  );
}

function EndpointRow({
  method,
  path,
  label,
}: {
  method: string;
  path: string;
  label: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
          {method}
        </Badge>
        <div>
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          <p className="font-mono text-xs text-neutral-500">{path}</p>
        </div>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(path);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded-md p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
