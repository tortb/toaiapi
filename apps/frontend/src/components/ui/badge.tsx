import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border text-foreground',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
} as const;

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
