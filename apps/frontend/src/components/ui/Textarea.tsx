import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, fullWidth = true, className, id, ...props },
  ref,
) {
  const textareaId = id || props.name;
  const hintId = hint && textareaId ? `${textareaId}-hint` : undefined;
  const errorId = error && textareaId ? `${textareaId}-error` : undefined;

  return (
    <label className={cn("block", fullWidth && "w-full")} htmlFor={textareaId}>
      {label && <span className="mb-1.5 block text-sm font-medium text-neutral-800">{label}</span>}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          "min-h-24 w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-neutral-950 shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition duration-150 ease-apple placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
          error ? "border-error/50" : "border-neutral-200",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(hintId, errorId) || undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className="mt-1.5 block text-sm text-error">{error}</span>
      ) : hint ? (
        <span id={hintId} className="mt-1.5 block text-sm text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
});
