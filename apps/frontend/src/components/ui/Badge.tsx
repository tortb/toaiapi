import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "error" | "info" | "purple";
type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variants: Record<BadgeVariant, { root: string; dot: string }> = {
  neutral: { root: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
  success: { root: "bg-success-bg text-success", dot: "bg-success" },
  warning: { root: "bg-warning-bg text-warning", dot: "bg-warning" },
  error: { root: "bg-error-bg text-error", dot: "bg-error" },
  info: { root: "bg-info-bg text-info", dot: "bg-info" },
  purple: { root: "bg-purple-bg text-purple", dot: "bg-purple" },
};

const sizes: Record<BadgeSize, string> = {
  sm: "gap-1 px-1.5 py-0.5 text-xs",
  md: "gap-1.5 px-2 py-0.5 text-sm",
};

export function Badge({ variant = "neutral", size = "md", dot = false, className, children, ...props }: BadgeProps) {
  const styles = variants[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium leading-5",
        styles.root,
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />}
      {children}
    </span>
  );
}

export function getBadgeVariant(status: string): BadgeVariant {
  const value = status.toLowerCase();
  if (["active", "success", "enabled", "completed", "paid", "approved", "issued"].includes(value)) return "success";
  if (["warning", "degraded", "partially", "pending", "processing", "rate_limited"].includes(value)) return "warning";
  if (["error", "failed", "disabled", "expired", "suspended"].includes(value)) return "error";
  if (["info", "refunded"].includes(value)) return "info";
  return "neutral";
}
