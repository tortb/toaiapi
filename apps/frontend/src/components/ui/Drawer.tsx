"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";
import { XIcon } from "./Icons";

type DrawerSide = "left" | "right";
type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: DrawerSide;
  size?: DrawerSize;
  footer?: ReactNode;
  children: ReactNode;
}

const sizes: Record<DrawerSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Drawer({ open, onClose, title, description, side = "right", size = "md", footer, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex", side === "right" ? "justify-end" : "justify-start")}>
      <button className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" aria-label="关闭抽屉" onClick={onClose} />
      <div
        className={cn(
          "relative flex h-full w-full flex-col bg-white shadow-modal",
          sizes[size],
          side === "right" ? "animate-slide-left" : "animate-slide-right",
        )}
      >
        <div className="flex min-h-16 items-start justify-between gap-4 border-b border-neutral-150 px-5 py-4">
          <div>
            {title && <h2 className="text-md font-semibold text-neutral-950">{title}</h2>}
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          <IconButton aria-label="关闭抽屉" icon={<XIcon size={16} />} onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-neutral-150 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
