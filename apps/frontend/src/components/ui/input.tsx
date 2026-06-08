'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2.5 bg-white border rounded-md text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-colors duration-150 ${
            error ? 'border-[var(--danger)]' : 'border-[var(--line)] hover:border-[var(--border-hover)] focus:border-[var(--accent)]'
          } focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
        {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
