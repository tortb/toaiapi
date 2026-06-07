import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "./Icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-neutral-950 text-white shadow-btn hover:bg-neutral-800 active:bg-neutral-950",
  secondary: "border border-neutral-200 bg-white text-neutral-900 shadow-btn hover:border-neutral-300 hover:bg-neutral-50",
  ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
  danger: "bg-error text-white shadow-btn hover:bg-red-500 active:bg-red-600",
  link: "h-auto px-0 py-0 text-neutral-900 underline-offset-4 hover:underline",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-sm",
  md: "h-9 rounded-lg px-3.5 text-sm",
  lg: "h-10 rounded-lg px-4 text-md",
  icon: "h-9 w-9 rounded-lg p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-transparent font-medium transition duration-150 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/10 disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        fullWidth && "w-full",
        loading && "cursor-wait",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? <LoaderIcon size={14} className="animate-spin" /> : leftIcon}
      {size !== "icon" && children}
      {!loading && rightIcon}
    </button>
  );
}
