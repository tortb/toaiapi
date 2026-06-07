"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent p-0.5 transition duration-200 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/10 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-neutral-950" : "bg-neutral-200",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow-sm transition duration-200 ease-apple-out",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}
