"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ModelFilterBarProps {
  providers: string[];
  onFilterChange: (filters: {
    search: string;
    provider: string;
    type: string;
    tag: string;
    billingType: string;
  }) => void;
}

export function ModelFilterBar({
  providers,
  onFilterChange,
}: ModelFilterBarProps) {
  const [search, setSearch] = React.useState("");
  const [provider, setProvider] = React.useState("all");
  const [type, setType] = React.useState("all");
  const [tag, setTag] = React.useState("all");
  const [billingType, setBillingType] = React.useState("all");

  const emit = React.useCallback(
    (overrides: Partial<{ search: string; provider: string; type: string; tag: string; billingType: string }> = {}) => {
      const filters = {
        search: overrides.search ?? search,
        provider: overrides.provider ?? provider,
        type: overrides.type ?? type,
        tag: overrides.tag ?? tag,
        billingType: overrides.billingType ?? billingType,
      };
      onFilterChange(filters);
    },
    [search, provider, type, tag, billingType, onFilterChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    emit({ search: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="搜索模型名称或描述..."
            value={search}
            onChange={handleSearchChange}
            startAdornment={<Search className="h-4 w-4" />}
            className="h-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <Select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                emit({ provider: e.target.value });
              }}
              options={[
                { label: "全部供应商", value: "all" },
                ...providers.map((p) => ({ label: p, value: p })),
              ]}
              className="h-10"
            />
          </div>
          <div className="w-32">
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                emit({ type: e.target.value });
              }}
              options={[
                { label: "全部类型", value: "all" },
                { label: "文本", value: "text" },
                { label: "图像", value: "image" },
                { label: "音频", value: "audio" },
                { label: "视频", value: "video" },
              ]}
              className="h-10"
            />
          </div>
          <div className="w-32">
            <Select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                emit({ tag: e.target.value });
              }}
              options={[
                { label: "全部标签", value: "all" },
                { label: "对话", value: "chat" },
                { label: "工具", value: "tool" },
                { label: "识图", value: "vision" },
                { label: "绘画", value: "image" },
                { label: "视频", value: "video" },
                { label: "音乐", value: "audio" },
              ]}
              className="h-10"
            />
          </div>
          <div className="w-32">
            <Select
              value={billingType}
              onChange={(e) => {
                setBillingType(e.target.value);
                emit({ billingType: e.target.value });
              }}
              options={[
                { label: "全部计费", value: "all" },
                { label: "按量计费", value: "token" },
                { label: "按次计费", value: "request" },
              ]}
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
