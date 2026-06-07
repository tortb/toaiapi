import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const sizeClass: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

export function IconButton({ icon, variant = "ghost", size = "md", className, ...props }: IconButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      className={cn(sizeClass[size], className)}
      {...props}
    >
      {icon}
    </Button>
  );
}
