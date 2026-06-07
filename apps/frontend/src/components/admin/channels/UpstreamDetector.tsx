"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface UpstreamDetectorProps {
  channelId: string;
  lastCheckedAt?: string | null;
  detectedModels?: string[];
  autoDetect?: boolean;
  onToggleAutoDetect?: (enabled: boolean) => void;
  onDetectNow?: () => void;
  isDetecting?: boolean;
}

export function UpstreamDetector({
  channelId,
  lastCheckedAt,
  detectedModels = [],
  autoDetect = false,
  onToggleAutoDetect,
  onDetectNow,
  isDetecting = false,
}: UpstreamDetectorProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-neutral-900 border-l-2 border-teal-500 pl-2">
        上游模型检测
      </h4>

      <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <div>
          <p className="text-sm text-neutral-700">定期检查上游模型变更</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            自动检测上游服务商的模型列表变化
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleAutoDetect?.(!autoDetect)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoDetect ? "bg-emerald-500" : "bg-neutral-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoDetect ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          上次检测:{" "}
          {lastCheckedAt
            ? new Date(lastCheckedAt).toLocaleString("zh-CN")
            : "从未"}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onDetectNow}
          loading={isDetecting}
          className="h-7 gap-1.5 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          立即检测
        </Button>
      </div>

      {detectedModels.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-700">
            检测到的可加入模型:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {detectedModels.map((model) => (
              <Badge key={model} variant="neutral" size="sm">
                {model}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
