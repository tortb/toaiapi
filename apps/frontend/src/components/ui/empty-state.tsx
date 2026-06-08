import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-[var(--text-muted)] mb-4">
        {icon || <Inbox className="w-12 h-12" />}
      </div>
      <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] mb-6 text-center max-w-sm">{description}</p>
      )}
      {action}
    </div>
  )
}
