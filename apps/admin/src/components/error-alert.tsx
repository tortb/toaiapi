import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  /** 错误信息 */
  message: string;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 错误提示组件
 *
 * 使用 CSS 变量（--destructive）而非硬编码颜色，支持主题切换。
 */
export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-0.5 text-destructive/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
