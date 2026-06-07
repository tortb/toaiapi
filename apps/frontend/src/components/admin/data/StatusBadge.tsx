import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@/components/ui";

export type StatusTone = NonNullable<BadgeProps["variant"]>;

export interface StatusBadgeProps {
  tone?: StatusTone;
  dot?: boolean;
  children: ReactNode;
}

export function StatusBadge({ tone = "neutral", dot = true, children }: StatusBadgeProps) {
  return (
    <Badge variant={tone} size="sm" dot={dot}>
      {children}
    </Badge>
  );
}
