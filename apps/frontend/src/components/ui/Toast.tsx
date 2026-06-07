"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "./Icons";
import { IconButton } from "./IconButton";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<ToastType, string> = {
  success: "border-success/20 bg-success-bg text-success",
  error: "border-error/20 bg-error-bg text-error",
  warning: "border-warning/20 bg-warning-bg text-warning",
  info: "border-info/20 bg-info-bg text-info",
};

const icons: Record<ToastType, ReactNode> = {
  success: <CheckIcon size={16} />,
  error: <XIcon size={16} />,
  warning: <AlertIcon size={16} />,
  info: <InfoIcon size={16} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo<ToastContextValue>(() => ({
    toast,
    success: (message) => toast("success", message),
    error: (message) => toast("error", message),
    warning: (message) => toast("warning", message),
    info: (message) => toast("info", message),
  }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className={cn("pointer-events-auto flex items-start gap-2.5 rounded-lg border px-4 py-3 shadow-popover animate-slide-up", styles[item.type])}>
            <span className="mt-0.5">{icons[item.type]}</span>
            <p className="min-w-0 flex-1 text-sm font-medium leading-5">{item.message}</p>
            <IconButton aria-label="关闭通知" icon={<XIcon size={14} />} size="sm" onClick={() => remove(item.id)} className="-mr-1 -mt-1 text-current hover:bg-black/5" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}
