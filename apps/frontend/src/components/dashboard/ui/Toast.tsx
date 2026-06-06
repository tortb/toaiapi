'use client';

import React from 'react';
import { IconCheckCircle, IconXCircle, IconWarning, IconInfo, IconClose } from '@/components/dashboard/ui/Icons';

/* ─── 类型 ─── */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <IconCheckCircle size={16} />,
  error: <IconXCircle size={16} />,
  warning: <IconWarning size={16} />,
  info: <IconInfo size={16} />,
};

const STYLES: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: 'bg-success/8', border: 'border-success/20', text: 'text-success', icon: 'text-success' },
  error: { bg: 'bg-error/8', border: 'border-error/20', text: 'text-error', icon: 'text-error' },
  warning: { bg: 'bg-warning/8', border: 'border-warning/20', text: 'text-warning', icon: 'text-warning' },
  info: { bg: 'bg-info/8', border: 'border-info/20', text: 'text-info', icon: 'text-info' },
};

/* ─── Context ─── */

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

/* ─── 单个 Toast ─── */

function ToastItemView({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const s = STYLES[item.type];

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border ${s.bg} ${s.border} shadow-[0_4px_16px_rgba(0,0,0,0.08)] animate-toast-in`}
    >
      <span className={`mt-0.5 ${s.icon}`}>{ICONS[item.type]}</span>
      <p className={`flex-1 text-sm ${s.text}`}>{item.message}</p>
      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-gray-600 mt-0.5">
        <IconClose size={14} />
      </button>

      <style jsx>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in {
          animation: toastIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ─── Provider ─── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = React.useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setItems((prev) => [...prev, { id, type, message }]);
    // 3.5s 后自动消失
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const ctx: ToastContextType = React.useMemo(() => ({
    toast: add,
    success: (m: string) => add('success', m),
    error: (m: string) => add('error', m),
    warning: (m: string) => add('warning', m),
    info: (m: string) => add('info', m),
  }), [add]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast 容器 — 固定在右上角 */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItemView item={item} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Hook ─── */

export function useToast(): ToastContextType {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider />');
  return ctx;
}
