import type { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

/** 统计数据卡片 */
export function DataCard({ title, value, icon: Icon, description }: DataCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
