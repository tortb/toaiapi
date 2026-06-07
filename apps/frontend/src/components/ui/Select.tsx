import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "./Icons";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, fullWidth = true, className, id, children, ...props },
  ref,
) {
  const selectId = id || props.name;
  const hintId = hint && selectId ? `${selectId}-hint` : undefined;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <label className={cn("block", fullWidth && "w-full")} htmlFor={selectId}>
      {label && <span className="mb-1.5 block text-sm font-medium text-neutral-800">{label}</span>}
      <span className="relative block">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-9 w-full appearance-none rounded-lg border bg-white py-0 pl-3 pr-9 text-sm text-neutral-950 shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition duration-150 ease-apple focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
            error ? "border-error/50" : "border-neutral-200",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(hintId, errorId) || undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDownIcon size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      </span>
      {error ? (
        <span id={errorId} className="mt-1.5 block text-sm text-error">{error}</span>
      ) : hint ? (
        <span id={hintId} className="mt-1.5 block text-sm text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
});
