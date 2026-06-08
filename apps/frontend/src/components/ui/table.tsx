import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}
export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`bg-white border border-[var(--line)] rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

interface THeadProps { children: ReactNode; className?: string }
export function THead({ children, className = '' }: THeadProps) {
  return <div className={`bg-[var(--surface-soft)] ${className}`}>{children}</div>
}

interface TRProps { children: ReactNode; className?: string }
export function TR({ children, className = '' }: TRProps) {
  return (
    <div className={`flex items-center px-4 py-3 gap-3 border-b border-[var(--line)] last:border-b-0 ${className}`}>
      {children}
    </div>
  )
}

interface THProps { children: ReactNode; className?: string; width?: string }
export function TH({ children, className = '', width }: THProps) {
  return (
    <div className={`text-xs font-semibold text-[var(--text-muted)] ${className}`} style={width ? { width, flex: 'none' } : { flex: 1 }}>
      {children}
    </div>
  )
}

interface TDProps { children: ReactNode; className?: string; width?: string }
export function TD({ children, className = '', width }: TDProps) {
  return (
    <div className={`text-sm text-[var(--foreground)] ${className}`} style={width ? { width, flex: 'none' } : { flex: 1 }}>
      {children}
    </div>
  )
}
