"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TIME_RANGES = [
  { key: "today", label: "今天" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "year", label: "今年" },
  { key: "all", label: "全部时间" },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {TIME_RANGES.map((range) => (
        <button
          key={range.key}
          onClick={() => onChange(range.key)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            value === range.key
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
