"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  model: {
    id: string;
    name: string;
    vendor?: string;
    input_price?: number | null;
    output_price?: number | null;
    cache_price?: number | null;
    description?: string | null;
    tags?: string[];
    type?: string;
    billing_type?: string;
  };
  onClick?: () => void;
}

function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) return "-";
  // 价格以分/百万token为单位，转换为元/百万token显示
  return `¥${(price / 100).toFixed(4)}/M`;
}

function getTypeIcon(type?: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-5 w-5" />;
    case "video":
      return <Video className="h-5 w-5" />;
    case "audio":
      return <Music className="h-5 w-5" />;
    default:
      return <MessageSquare className="h-5 w-5" />;
  }
}

const TAG_LABELS: Record<string, string> = {
  chat: "对话",
  tool: "工具",
  vision: "识图",
  image: "绘画",
  video: "视频",
  audio: "音乐",
};

export function ModelCard({ model, onClick }: ModelCardProps) {
  const tags = model.tags || ["对话"];
  const billingType = model.billing_type === "request" ? "按次计费" : "按量计费";

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            {getTypeIcon(model.type)}
          </div>
          <Badge
            variant="neutral"
            size="sm"
            className="bg-neutral-50 text-[10px] font-bold uppercase tracking-wider"
          >
            {model.vendor || "Public"}
          </Badge>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-neutral-900">{model.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {model.description ||
              "暂无模型描述。该模型提供了卓越的语言理解与生成能力，适用于各种复杂的 AI 应用场景。"}
          </p>
        </div>

        <div className="mt-6 space-y-2 rounded-xl bg-neutral-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-neutral-400">
              输入价格
            </span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-bold text-neutral-700">
                {formatPrice(model.input_price)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-neutral-400">
              补全价格
            </span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-bold text-neutral-700">
                {formatPrice(model.output_price)}
              </span>
            </div>
          </div>
          {model.cache_price !== undefined && model.cache_price !== null && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-neutral-400">
                缓存命中
              </span>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-emerald-500" />
                <span className="text-xs font-bold text-neutral-700">
                  {formatPrice(model.cache_price)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-neutral-100 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-400"
            >
              {TAG_LABELS[tag] || tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-dashed border-neutral-100">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          {billingType}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          立即体验
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
