"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";
import { XIcon } from "./Icons";

type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
}

const sizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, footer, size = "md", children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" aria-label="关闭弹窗" onClick={onClose} />
      <div className={cn("relative flex max-h-[calc(100vh-48px)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-modal animate-scale-in", sizes[size])}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-neutral-150 px-5 py-4">
            <div>
              {title && <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>}
              {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
            </div>
            <IconButton aria-label="关闭弹窗" icon={<XIcon size={16} />} onClick={onClose} />
          </div>
        )}
        {!title && !description && (
          <IconButton aria-label="关闭弹窗" icon={<XIcon size={16} />} className="absolute right-3 top-3 z-10" onClick={onClose} />
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-neutral-150 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
