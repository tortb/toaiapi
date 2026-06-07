"use client";

import type { ReactNode } from "react";
import { Input, SearchIcon } from "@/components/ui";

export interface AdminToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "搜索",
  actions,
  children,
}: AdminToolbarProps) {
  const hasSearch = typeof searchValue === "string" && onSearchChange;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {hasSearch && (
          <div className="w-full sm:max-w-sm">
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              startAdornment={<SearchIcon size={15} />}
            />
          </div>
        )}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
