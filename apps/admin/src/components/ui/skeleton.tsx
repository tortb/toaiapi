import { cn } from '@/lib/utils';

/**
 * 骨架屏组件
 * 用于加载状态占位
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-shimmer rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
