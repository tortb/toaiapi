import type { LucideIcon } from 'lucide-react';

interface DataCardProps {
  /** 标题 */
  title: string;
  /** 数值 */
  value: string | number;
  /** 图标 */
  icon: LucideIcon;
  /** 描述文字 */
  description?: string;
}

/**
 * 统计数据卡片
 *
 * 展示单个统计指标，包含标题、数值、图标和可选描述。
 * 数值自动添加千分位分隔符。
 */
export function DataCard({ title, value, icon: Icon, description }: DataCardProps) {
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('zh-CN')
    : value;

  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">{formattedValue}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
