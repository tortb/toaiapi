import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default:
    'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110',
  secondary:
    'bg-white/[0.06] text-white/90 border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15]',
  outline:
    'border border-white/[0.1] bg-transparent text-white/80 hover:bg-white/[0.05] hover:border-white/[0.2] hover:text-white',
  ghost:
    'text-white/60 hover:bg-white/[0.06] hover:text-white',
  destructive:
    'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
} as const;

const sizes = {
  default: 'h-10 px-5 py-2 text-sm',
  sm: 'h-9 px-4 text-sm',
  lg: 'h-11 px-8 text-base',
  icon: 'h-10 w-10',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
