import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, startAdornment, endAdornment, fullWidth = true, className, id, ...props },
  ref,
) {
  const inputId = id || props.name;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className={cn("block", fullWidth && "w-full")} htmlFor={inputId}>
      {label && <span className="mb-1.5 block text-sm font-medium text-neutral-800">{label}</span>}
      <span
        className={cn(
          "flex h-9 items-center rounded-lg border bg-white px-3 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition duration-150 ease-apple focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-950/5",
          error ? "border-error/50" : "border-neutral-200",
          props.disabled && "bg-neutral-50 text-neutral-400",
        )}
      >
        {startAdornment && <span className="mr-2 flex text-neutral-400">{startAdornment}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent p-0 text-neutral-950 placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(hintId, errorId) || undefined}
          {...props}
        />
        {endAdornment && <span className="ml-2 flex text-neutral-400">{endAdornment}</span>}
      </span>
      {error ? (
        <span id={errorId} className="mt-1.5 block text-sm text-error">{error}</span>
      ) : hint ? (
        <span id={hintId} className="mt-1.5 block text-sm text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
});
