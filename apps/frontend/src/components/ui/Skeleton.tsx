import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "rect" | "circle" | "card" | "table";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  lines?: number;
}

export function Skeleton({ variant = "rect", lines = 3, className, ...props }: SkeletonProps) {
  if (variant === "table") {
    return (
      <div className={cn("overflow-hidden rounded-xl border border-neutral-200 bg-white", className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 border-b border-neutral-100 px-4 py-3 last:border-b-0">
            {Array.from({ length: 5 }).map((__, cellIndex) => (
              <div key={cellIndex} className="h-3 rounded bg-neutral-100 animate-skeleton" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("rounded-xl border border-neutral-200 bg-white p-5", className)} {...props}>
        <div className="mb-4 h-4 w-1/3 rounded bg-neutral-100 animate-skeleton" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="h-3 rounded bg-neutral-100 animate-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-skeleton bg-neutral-100",
        variant === "text" && "h-3 rounded",
        variant === "rect" && "h-20 rounded-lg",
        variant === "circle" && "h-10 w-10 rounded-full",
        className,
      )}
      {...props}
    />
  );
}
