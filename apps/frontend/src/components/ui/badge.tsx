import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  secondary: 'bg-white/[0.06] text-white/60 border-white/[0.08]',
  destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
  outline: 'border-white/[0.1] text-white/60',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
} as const;

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
