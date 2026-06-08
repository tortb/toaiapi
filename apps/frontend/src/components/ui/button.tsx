'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 active:scale-[0.98] shadow-[0_1px_1px_rgba(0,0,0,0.08)]',
  secondary: 'border border-[var(--line)] text-[var(--foreground)] hover:bg-[var(--surface-soft)] active:scale-[0.98]',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 active:scale-[0.98]',
} as const

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
