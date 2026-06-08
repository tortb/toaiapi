export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';

export interface NotifyOptions {
  variant?: FeedbackVariant;
  title?: string;
  message: string;
  detail?: unknown;
  duration?: number;
  copyText?: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export const FEEDBACK_NOTIFY_EVENT = 'toaiapi-feedback-notify';
export const FEEDBACK_CONFIRM_EVENT = 'toaiapi-feedback-confirm';

const notifiedErrors = new WeakSet<object>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringifyMessage(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => stringifyMessage(item)).filter(Boolean).join('；');
  if (isRecord(value)) {
    if ('message' in value) return stringifyMessage(value.message);
    if ('error' in value) return stringifyMessage(value.error);
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  if (value == null) return null;
  return String(value);
}

function unwrapApiErrorText(message: string): string {
  const match = message.match(/^API Error \d+:\s*(.*)$/);
  if (!match?.[1]) return message;

  const raw = match[1].trim();
  if (!raw) return message;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return stringifyMessage(parsed) || message;
  } catch {
    return raw;
  }
}

export function redactFeedbackText(value: string): string {
  return value
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[token]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [token]')
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-****')
    .replace(/(api[_-]?key|secret|password|token)(['"\s:=]+)[^,}\]\s]+/gi, '[redacted]');
}

export function getErrorMessage(error: unknown, fallback = '操作失败'): string {
  const raw = error instanceof Error ? error.message : stringifyMessage(error);
  const message = raw ? unwrapApiErrorText(raw) : fallback;
  return redactFeedbackText(message || fallback).slice(0, 1200);
}

export function notify(options: NotifyOptions): void {
  if (typeof window === 'undefined') return;
  const message = redactFeedbackText(options.message).slice(0, 1200);
  const detail = typeof options.detail === 'string' ? redactFeedbackText(options.detail).slice(0, 4000) : options.detail;
  window.dispatchEvent(new CustomEvent<NotifyOptions>(FEEDBACK_NOTIFY_EVENT, {
    detail: {
      ...options,
      message,
      detail,
      variant: options.variant || 'info',
    },
  }));
}

export function notifyError(error: unknown, fallback = '操作失败', options: Omit<NotifyOptions, 'message' | 'variant'> = {}): void {
  if (typeof error === 'object' && error !== null) {
    if (notifiedErrors.has(error)) return;
    notifiedErrors.add(error);
  }

  notify({
    ...options,
    variant: 'error',
    title: options.title || fallback,
    message: getErrorMessage(error, fallback),
    duration: options.duration ?? 0,
  });
}

export function notifySuccess(message: string, title = '操作成功'): void {
  notify({ variant: 'success', title, message, duration: 4200 });
}

export function notifyInfo(message: string, title = '提示'): void {
  notify({ variant: 'info', title, message, duration: 5200 });
}

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent<ConfirmRequest>(FEEDBACK_CONFIRM_EVENT, {
      detail: {
        confirmText: '确认',
        cancelText: '取消',
        variant: 'default',
        ...options,
        resolve,
      },
    }));
  });
}
