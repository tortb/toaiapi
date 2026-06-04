import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

/** 错误提示组件 */
export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-red-400">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 hover:text-red-300">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
