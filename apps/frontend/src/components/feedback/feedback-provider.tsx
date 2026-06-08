"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Clipboard, Info, X } from "lucide-react";
import {
  FEEDBACK_CONFIRM_EVENT,
  FEEDBACK_NOTIFY_EVENT,
  type ConfirmRequest,
  type FeedbackVariant,
  type NotifyOptions,
} from "@/lib/feedback/events";

type Toast = NotifyOptions & {
  id: string;
  variant: FeedbackVariant;
  createdAt: number;
};

const variantConfig: Record<FeedbackVariant, { icon: typeof Info; tone: string; bar: string; title: string }> = {
  error: {
    icon: AlertCircle,
    tone: "border-red-200 bg-red-50 text-red-900",
    bar: "bg-red-500",
    title: "发生错误",
  },
  warning: {
    icon: AlertTriangle,
    tone: "border-amber-200 bg-amber-50 text-amber-900",
    bar: "bg-amber-500",
    title: "请注意",
  },
  success: {
    icon: CheckCircle2,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    bar: "bg-emerald-500",
    title: "操作成功",
  },
  info: {
    icon: Info,
    tone: "border-sky-200 bg-sky-50 text-sky-900",
    bar: "bg-sky-500",
    title: "提示",
  },
};

function toDetailText(detail: unknown): string {
  if (!detail) return "";
  if (typeof detail === "string") return detail;
  try {
    return JSON.stringify(detail, null, 2);
  } catch {
    return String(detail);
  }
}

function buildCopyText(toast: Toast): string {
  const lines = [toast.title || variantConfig[toast.variant].title, toast.message];
  const detail = toDetailText(toast.detail);
  if (detail) lines.push("", detail);
  return lines.filter(Boolean).join("\n");
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    function handleNotify(event: Event) {
      const detail = (event as CustomEvent<NotifyOptions>).detail;
      if (!detail?.message) return;

      const variant = detail.variant || "info";
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = {
        ...detail,
        id,
        variant,
        title: detail.title || variantConfig[variant].title,
        createdAt: Date.now(),
      };

      setToasts((items) => [toast, ...items].slice(0, 5));

      const duration = detail.duration ?? (variant === "error" ? 0 : 5000);
      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    }

    function handleConfirm(event: Event) {
      const detail = (event as CustomEvent<ConfirmRequest>).detail;
      if (!detail?.message || typeof detail.resolve !== "function") return;
      setConfirmRequest(detail);
    }

    window.addEventListener(FEEDBACK_NOTIFY_EVENT, handleNotify);
    window.addEventListener(FEEDBACK_CONFIRM_EVENT, handleConfirm);
    return () => {
      window.removeEventListener(FEEDBACK_NOTIFY_EVENT, handleNotify);
      window.removeEventListener(FEEDBACK_CONFIRM_EVENT, handleConfirm);
    };
  }, [removeToast]);

  useEffect(() => {
    if (!confirmRequest) return;

    const request = confirmRequest;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        request.resolve(false);
        setConfirmRequest(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmRequest]);

  const activeConfirm = useMemo(() => confirmRequest, [confirmRequest]);

  async function handleCopy(toast: Toast) {
    await copyText(toast.copyText || buildCopyText(toast));
    setCopiedId(toast.id);
    window.setTimeout(() => setCopiedId((value) => (value === toast.id ? null : value)), 1600);
  }

  function settleConfirm(confirmed: boolean) {
    if (!activeConfirm) return;
    activeConfirm.resolve(confirmed);
    setConfirmRequest(null);
  }

  return (
    <>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[calc(100vw-2rem)] max-w-[420px] flex-col gap-3 sm:right-5 sm:top-5">
        {toasts.map((toast) => {
          const config = variantConfig[toast.variant];
          const Icon = config.icon;
          const detail = toDetailText(toast.detail);
          const copied = copiedId === toast.id;

          return (
            <div key={toast.id} className={`pointer-events-auto overflow-hidden rounded-lg border shadow-lg shadow-black/10 ${config.tone}`} role="status" aria-live={toast.variant === "error" ? "assertive" : "polite"}>
              <div className={`h-1 ${config.bar}`} />
              <div className="flex gap-3 p-3.5">
                <Icon className="mt-0.5 h-5 w-5 flex-none" />
                <div className="min-w-0 flex-1">
                  <div className="break-words text-sm font-semibold leading-5">{toast.title}</div>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-current/85">{toast.message}</div>
                  {detail && <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white/65 p-2 text-xs leading-5 text-current/80">{detail}</pre>}
                </div>
                <div className="flex flex-none items-start gap-1">
                  <button type="button" onClick={() => void handleCopy(toast)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-current/70 hover:bg-white/60 hover:text-current" title="复制提示内容" aria-label="复制提示内容">
                    {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => removeToast(toast.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-current/70 hover:bg-white/60 hover:text-current" title="关闭" aria-label="关闭提示">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-[420px] rounded-lg border border-[var(--line)] bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-full ${activeConfirm.variant === "danger" ? "bg-red-50 text-red-600" : "bg-[var(--accent-light)] text-[var(--accent)]"}`}>
                {activeConfirm.variant === "danger" ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-base font-semibold text-[var(--foreground)]">{activeConfirm.title || "确认操作"}</h2>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--text-secondary)]">{activeConfirm.message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => settleConfirm(false)} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
                {activeConfirm.cancelText || "取消"}
              </button>
              <button type="button" onClick={() => settleConfirm(true)} className={`rounded-md px-4 py-2 text-sm font-medium text-white ${activeConfirm.variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[var(--accent)] hover:bg-[var(--accent)]/90"}`}>
                {activeConfirm.confirmText || "确认"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
