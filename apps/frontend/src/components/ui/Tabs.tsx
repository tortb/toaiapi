"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onValueChange, className }: TabsProps) {
  return (
    <div className={cn("inline-flex items-center rounded-lg bg-neutral-100 p-1", className)} role="tablist">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            className={cn(
              "h-8 rounded-md px-3 text-sm font-medium transition duration-150 ease-apple disabled:pointer-events-none disabled:opacity-50",
              active ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-800",
            )}
            onClick={() => onValueChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
