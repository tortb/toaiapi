import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
  subtext?: string
  className?: string
}

export function StatCard({ label, value, trend, subtext, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white border border-[var(--line)] rounded-lg p-4 ${className}`}>
      <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
      <div className="text-2xl font-semibold text-[var(--foreground)] mb-1">{value}</div>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            trend.direction === 'up' ? 'text-[var(--success)]' :
            trend.direction === 'down' ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
        {subtext && <span className="text-xs text-[var(--text-muted)]">{subtext}</span>}
      </div>
    </div>
  )
}
