import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "plain" | "elevated" | "interactive";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  plain: "border border-neutral-200 bg-card",
  elevated: "border border-neutral-200 bg-card shadow-card",
  interactive: "border border-neutral-200 bg-card shadow-card transition duration-200 ease-apple hover:-translate-y-px hover:border-neutral-300 hover:shadow-card-hover",
};

export function Card({ variant = "plain", className, ...props }: CardProps) {
  return <div className={cn("rounded-xl", variants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-md font-semibold text-neutral-950", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-neutral-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-neutral-150 px-5 py-3", className)} {...props} />;
}
