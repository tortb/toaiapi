import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, hover, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-[var(--line)] rounded-lg ${hover ? 'transition-all duration-150 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[var(--border-hover)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-[var(--line)] ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-[var(--foreground)] ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-[var(--text-secondary)] ${className}`}>{children}</p>
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-t border-[var(--line)] ${className}`}>{children}</div>
}
