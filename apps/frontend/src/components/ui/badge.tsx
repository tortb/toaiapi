import type { ReactNode } from 'react'

const variantStyles = {
  default: 'bg-[var(--accent-light)] text-[var(--accent)]',
  success: 'bg-[var(--success-bg)] text-[var(--success)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  danger: 'bg-[var(--danger-bg)] text-[var(--danger)]',
  info: 'bg-[var(--info-bg)] text-[var(--info)]',
  outline: 'border border-[var(--line)] text-[var(--text-secondary)]',
  disabled: 'bg-[var(--surface-soft)] text-[var(--text-muted)]',
}

interface BadgeProps {
  variant?: keyof typeof variantStyles
  size?: 'sm' | 'md'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
