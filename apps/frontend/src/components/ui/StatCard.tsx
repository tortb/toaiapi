import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "flat";
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{value}</div>
        </div>
        {icon && <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">{icon}</div>}
      </div>
      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-error",
                trend.direction === "flat" && "text-neutral-500",
              )}
            >
              {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}{trend.value}
            </span>
          )}
          {subtitle && <span className="text-neutral-500">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}
