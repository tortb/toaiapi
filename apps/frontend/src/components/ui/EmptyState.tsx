import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmptyIcon } from "./Icons";

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title = "暂无数据", description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
        {icon || <EmptyIcon size={22} />}
      </div>
      <div className="text-md font-medium text-neutral-950">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-neutral-500">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
