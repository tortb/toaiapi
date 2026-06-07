import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, ...props },
  ref,
) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-neutral-800">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 accent-neutral-950 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {(label || description) && (
        <span className="grid gap-0.5">
          {label && <span className="font-medium leading-5">{label}</span>}
          {description && <span className="text-sm leading-5 text-neutral-500">{description}</span>}
        </span>
      )}
    </label>
  );
});
